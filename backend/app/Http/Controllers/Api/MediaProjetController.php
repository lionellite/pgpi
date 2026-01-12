<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\StoreMediaProjetRequest;
use App\Http\Resources\MediaProjetResource;
use App\Models\MediaProjet;
use App\Models\Projet;
use App\Models\Partenaire;
use App\Traits\Auditable;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;
use Illuminate\Support\Facades\Storage;

class MediaProjetController extends Controller
{
    use Auditable;
    /**
     * Display a listing of the resource.
     */
    public function index(Request $request, Projet $projet): AnonymousResourceCollection
    {
        $query = $projet->medias();
        
        // Filtres
        if ($request->has('type')) {
            $query->where('type', $request->type);
        }
        if ($request->has('search')) {
            $search = $request->search;
            $query->where(function($q) use ($search) {
                $q->where('titre', 'like', "%{$search}%")
                  ->orWhere('description', 'like', "%{$search}%");
            });
        }
        
        // Tri
        $sortBy = $request->get('sort_by', 'created_at');
        $sortOrder = $request->get('sort_order', 'desc');
        $query->orderBy($sortBy, $sortOrder);
        
        $medias = $query->get();
        
        return MediaProjetResource::collection($medias);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(StoreMediaProjetRequest $request, Projet $projet): JsonResponse
    {
        $user = $request->user();
        
        // Vérifier les permissions (incluant partenaires avec accès limité)
        if (!$this->canAddMedia($user, $projet)) {
            return response()->json(['message' => 'Accès refusé'], 403);
        }
        
        $file = $request->file('fichier');
        $path = $file->store('projets/medias', 'public');

        $media = MediaProjet::create([
            'projet_id' => $projet->id,
            'titre' => $request->titre ?? $file->getClientOriginalName(),
            'description' => $request->description,
            'type' => $request->type,
            'chemin_fichier' => Storage::url($path),
            'nom_fichier' => $file->getClientOriginalName(),
            'mime_type' => $file->getMimeType(),
            'taille' => $file->getSize(),
        ]);

        $media->load('projet');

        return response()->json([
            'message' => 'Média ajouté avec succès',
            'data' => new MediaProjetResource($media)
        ], 201);
    }

    /**
     * Display the specified resource.
     */
    public function show(MediaProjet $mediaProjet): JsonResponse
    {
        $mediaProjet->load('projet');
        
        return response()->json([
            'data' => new MediaProjetResource($mediaProjet)
        ]);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, MediaProjet $mediaProjet): JsonResponse
    {
        $user = $request->user();
        
        if (!$this->canModifyProjet($user, $mediaProjet->projet)) {
            return response()->json(['message' => 'Accès refusé'], 403);
        }

        $request->validate([
            'titre' => 'sometimes|required|string|max:255',
            'description' => 'nullable|string',
        ]);

        $mediaProjet->update($request->only(['titre', 'description']));
        $mediaProjet->load('projet');

        return response()->json([
            'message' => 'Média mis à jour avec succès',
            'data' => new MediaProjetResource($mediaProjet)
        ]);
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(Request $request, MediaProjet $mediaProjet): JsonResponse
    {
        $user = $request->user();
        
        // Vérifier les permissions : créateur, admin ou directeur
        $canDelete = $user->isAdmin() 
            || $user->isDirecteur() 
            || $mediaProjet->projet->chef_projet_id === $user->id
            || ($mediaProjet->projet->personnel()->where('user_id', $user->id)->exists() && $user->id === $mediaProjet->created_by ?? null);
        
        if (!$canDelete) {
            return response()->json(['message' => 'Accès refusé'], 403);
        }

        $request->validate([
            'justification' => 'required|string|min:10',
        ]);

        $oldData = $mediaProjet->toArray();
        
        $this->logAction(
            'delete',
            MediaProjet::class,
            $mediaProjet->id,
            $request,
            $request->justification,
            $oldData
        );

        // Supprimer le fichier
        $filePath = str_replace('/storage/', '', $mediaProjet->chemin_fichier);
        if (Storage::disk('public')->exists($filePath)) {
            Storage::disk('public')->delete($filePath);
        }

        $mediaProjet->delete();

        return response()->json(['message' => 'Média supprimé avec succès'], 200);
    }

    /**
     * Download media file
     */
    public function download(Request $request, MediaProjet $mediaProjet)
    {
        // Vérifier que l'utilisateur est authentifié
        if (!$request->user()) {
            return response()->json(['message' => 'Non authentifié'], 401);
        }

        $filePath = str_replace('/storage/', '', $mediaProjet->chemin_fichier);
        
        if (!Storage::disk('public')->exists($filePath)) {
            return response()->json(['message' => 'Fichier non trouvé'], 404);
        }

        return Storage::disk('public')->download($filePath, $mediaProjet->nom_fichier);
    }

    /**
     * Check if user can modify project
     */
    private function canModifyProjet($user, Projet $projet): bool
    {
        // Admin et directeur ont tous les droits
        if ($user->isAdmin() || $user->isDirecteur()) {
            return true;
        }
        
        // Chef de projet peut modifier
        if ($projet->chef_projet_id === $user->id) {
            return true;
        }
        
        // Personnel peut modifier
        if ($projet->personnel()->where('user_id', $user->id)->exists()) {
            return true;
        }
        
        // Partenaire chef de projet peut modifier
        if ($user->role === 'partenaire' && $projet->chef_projet_id === $user->id) {
            return true;
        }
        
        return false;
    }

    /**
     * Check if user can add media (including partners with limited access)
     */
    private function canAddMedia($user, Projet $projet): bool
    {
        // Si l'utilisateur peut modifier, il peut ajouter
        if ($this->canModifyProjet($user, $projet)) {
            return true;
        }
        
        // Partenaires associés peuvent déposer des médias (accès limité)
        if ($user->role === 'partenaire') {
            // Vérifier si c'est un partenaire associé au projet (via table pivot)
            // L'utilisateur partenaire doit avoir le même email qu'un partenaire associé
            $partenaire = Partenaire::where('email', $user->email)->first();
            if ($partenaire) {
                return $projet->partenaires()->where('partenaires.id', $partenaire->id)->exists();
            }
        }
        
        return false;
    }
}

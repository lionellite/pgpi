<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\StoreDocumentProjetRequest;
use App\Http\Resources\DocumentProjetResource;
use App\Models\DocumentProjet;
use App\Models\Projet;
use App\Models\Partenaire;
use App\Traits\Auditable;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;
use Illuminate\Support\Facades\Storage;

class DocumentProjetController extends Controller
{
    use Auditable;
    /**
     * Display a listing of the resource.
     */
    public function index(Request $request, Projet $projet): AnonymousResourceCollection
    {
        $query = $projet->documents()->with('dernierModificateur');
        
        // Filtres
        if ($request->has('type')) {
            $query->where('type', $request->type);
        }
        if ($request->has('etat')) {
            $query->where('etat', $request->etat);
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
        
        // Pagination
        $perPage = $request->get('per_page', 12);
        $documents = $query->paginate($perPage);
        
        return DocumentProjetResource::collection($documents);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(StoreDocumentProjetRequest $request, Projet $projet): JsonResponse
    {
        $user = $request->user();
        
        // Vérifier les permissions (incluant partenaires avec accès limité)
        if (!$this->canAddDocument($user, $projet)) {
            return response()->json(['message' => 'Accès refusé'], 403);
        }
        
        $file = $request->file('fichier');
        $path = $file->store('projets/documents', 'public');

        $document = DocumentProjet::create([
            'projet_id' => $projet->id,
            'titre' => $request->titre,
            'description' => $request->description,
            'type' => $request->type,
            'etat' => 'brouillon',
            'chemin_fichier' => Storage::url($path),
            'nom_fichier' => $file->getClientOriginalName(),
            'mime_type' => $file->getMimeType(),
            'taille' => $file->getSize(),
            'version' => 1,
            'derniere_mise_a_jour_par' => $user->id,
            'derniere_mise_a_jour' => now(),
        ]);

        $document->load(['projet', 'dernierModificateur']);

        return response()->json([
            'message' => 'Document ajouté avec succès',
            'data' => new DocumentProjetResource($document)
        ], 201);
    }

    /**
     * Display the specified resource.
     */
    public function show(DocumentProjet $documentProjet): JsonResponse
    {
        $documentProjet->load(['projet', 'dernierModificateur']);
        
        return response()->json([
            'data' => new DocumentProjetResource($documentProjet)
        ]);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, DocumentProjet $documentProjet): JsonResponse
    {
        $user = $request->user();
        
        if (!$this->canModifyProjet($user, $documentProjet->projet)) {
            return response()->json(['message' => 'Accès refusé'], 403);
        }

        $request->validate([
            'titre' => 'sometimes|required|string|max:255',
            'description' => 'nullable|string',
            'type' => 'sometimes|in:rapport,budget,technique,administratif,autre',
            'fichier' => 'sometimes|file|mimes:pdf,doc,docx,xls,xlsx,ppt,pptx,txt|max:10240',
        ]);

        $data = $request->only(['titre', 'description', 'type']);

        // Nouvelle version du fichier
        if ($request->hasFile('fichier')) {
            // Supprimer l'ancien fichier
            $oldFilePath = str_replace('/storage/', '', $documentProjet->chemin_fichier);
            if (Storage::disk('public')->exists($oldFilePath)) {
                Storage::disk('public')->delete($oldFilePath);
            }

            $file = $request->file('fichier');
            $path = $file->store('projets/documents', 'public');

            $data['chemin_fichier'] = Storage::url($path);
            $data['nom_fichier'] = $file->getClientOriginalName();
            $data['mime_type'] = $file->getMimeType();
            $data['taille'] = $file->getSize();
            $data['version'] = $documentProjet->version + 1;
        }

        $data['derniere_mise_a_jour_par'] = $user->id;
        $data['derniere_mise_a_jour'] = now();

        $documentProjet->update($data);
        $documentProjet->load(['projet', 'dernierModificateur']);

        return response()->json([
            'message' => 'Document mis à jour avec succès',
            'data' => new DocumentProjetResource($documentProjet)
        ]);
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(Request $request, DocumentProjet $documentProjet): JsonResponse
    {
        $user = $request->user();
        
        // Vérifier les permissions : créateur, admin ou directeur
        $canDelete = $user->isAdmin() 
            || $user->isDirecteur() 
            || $documentProjet->projet->chef_projet_id === $user->id
            || ($documentProjet->projet->personnel()->where('user_id', $user->id)->exists() && $user->id === $documentProjet->derniere_mise_a_jour_par ?? null);
        
        if (!$canDelete) {
            return response()->json(['message' => 'Accès refusé'], 403);
        }

        $request->validate([
            'justification' => 'required|string|min:10',
        ]);

        $oldData = $documentProjet->toArray();
        
        $this->logAction(
            'delete',
            DocumentProjet::class,
            $documentProjet->id,
            $request,
            $request->justification,
            $oldData
        );

        // Supprimer le fichier
        $filePath = str_replace('/storage/', '', $documentProjet->chemin_fichier);
        if (Storage::disk('public')->exists($filePath)) {
            Storage::disk('public')->delete($filePath);
        }

        $documentProjet->delete();

        return response()->json(['message' => 'Document supprimé avec succès'], 200);
    }

    /**
     * Validate a document
     */
    public function valider(DocumentProjet $documentProjet): JsonResponse
    {
        $user = request()->user();
        
        if (!$user->isAdmin() && !$user->isDirecteur()) {
            return response()->json(['message' => 'Accès refusé'], 403);
        }

        $documentProjet->update(['etat' => 'valide']);
        $documentProjet->load(['projet', 'dernierModificateur']);

        return response()->json([
            'message' => 'Document validé avec succès',
            'data' => new DocumentProjetResource($documentProjet)
        ]);
    }

    /**
     * Reject a document
     */
    public function rejeter(DocumentProjet $documentProjet): JsonResponse
    {
        $user = request()->user();
        
        if (!$user->isAdmin() && !$user->isDirecteur()) {
            return response()->json(['message' => 'Accès refusé'], 403);
        }

        $documentProjet->update(['etat' => 'rejete']);
        $documentProjet->load(['projet', 'dernierModificateur']);

        return response()->json([
            'message' => 'Document rejeté',
            'data' => new DocumentProjetResource($documentProjet)
        ]);
    }

    /**
     * Download document file
     */
    public function download(Request $request, DocumentProjet $documentProjet)
    {
        // Vérifier que l'utilisateur est authentifié
        if (!$request->user()) {
            return response()->json(['message' => 'Non authentifié'], 401);
        }

        $filePath = str_replace('/storage/', '', $documentProjet->chemin_fichier);
        
        if (!Storage::disk('public')->exists($filePath)) {
            return response()->json(['message' => 'Fichier non trouvé'], 404);
        }

        return Storage::disk('public')->download($filePath, $documentProjet->nom_fichier);
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
        
        return false;
    }

    /**
     * Check if user can add document (including partners with limited access)
     */
    private function canAddDocument($user, Projet $projet): bool
    {
        // Si l'utilisateur peut modifier, il peut ajouter
        if ($this->canModifyProjet($user, $projet)) {
            return true;
        }
        
        return false;
    }
}

<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\StoreActiviteProjetRequest;
use App\Http\Resources\ActiviteProjetResource;
use App\Models\ActiviteProjet;
use App\Models\Projet;
use App\Traits\Auditable;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;

class ActiviteProjetController extends Controller
{
    use Auditable;
    /**
     * Display a listing of the resource.
     */
    public function index(Request $request, Projet $projet): AnonymousResourceCollection
    {
        $activites = $projet->activites()
            ->orderBy('date_debut', 'asc')
            ->get();
        
        return ActiviteProjetResource::collection($activites);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(StoreActiviteProjetRequest $request, Projet $projet): JsonResponse
    {
        $data = $request->validated();
        $data['projet_id'] = $projet->id;
        $data['etat'] = $data['etat'] ?? 'planifie';
        $data['avancement'] = $data['avancement'] ?? 0;

        if (isset($data['data']) && is_string($data['data'])) {
            $data['data'] = json_decode($data['data'], true);
        }

        $activite = ActiviteProjet::create($data);
        $activite->load('projet');

        return response()->json([
            'message' => 'Activité créée avec succès',
            'data' => new ActiviteProjetResource($activite)
        ], 201);
    }

    /**
     * Display the specified resource.
     */
    public function show(ActiviteProjet $activiteProjet): JsonResponse
    {
        $activiteProjet->load('projet');
        
        return response()->json([
            'data' => new ActiviteProjetResource($activiteProjet)
        ]);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, ActiviteProjet $activiteProjet): JsonResponse
    {
        $user = $request->user();
        
        if (!$this->canModifyProjet($user, $activiteProjet->projet)) {
            return response()->json(['message' => 'Accès refusé'], 403);
        }

        $request->validate([
            'titre' => 'sometimes|required|string|max:255',
            'date_debut' => 'sometimes|required|date',
            'date_fin' => 'sometimes|required|date|after:date_debut',
            'activit_mene' => 'nullable|string',
            'data' => 'nullable|json',
            'duree_activite' => 'nullable|integer|min:1',
            'description' => 'nullable|string',
            'etat' => 'sometimes|in:planifie,en_cours,termine,suspendu',
            'type' => 'sometimes|in:atelier,construction,acquisition,formation,recherche,autre',
            'avancement' => 'nullable|integer|min:0|max:100',
        ]);

        $data = $request->all();

        if (isset($data['data']) && is_string($data['data'])) {
            $data['data'] = json_decode($data['data'], true);
        }

        $activiteProjet->update($data);
        $activiteProjet->load('projet');

        return response()->json([
            'message' => 'Activité mise à jour avec succès',
            'data' => new ActiviteProjetResource($activiteProjet)
        ]);
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(Request $request, ActiviteProjet $activiteProjet): JsonResponse
    {
        $user = $request->user();
        
        // Vérifier les permissions : créateur, admin ou directeur
        $canDelete = $user->isAdmin() 
            || $user->isDirecteur() 
            || $activiteProjet->projet->chef_projet_id === $user->id
            || ($activiteProjet->projet->personnel()->where('user_id', $user->id)->exists() && $user->id === $activiteProjet->created_by ?? null);
        
        if (!$canDelete) {
            return response()->json(['message' => 'Accès refusé'], 403);
        }

        $request->validate([
            'justification' => 'required|string|min:10',
        ]);

        $oldData = $activiteProjet->toArray();
        
        $this->logAction(
            'delete',
            ActiviteProjet::class,
            $activiteProjet->id,
            $request,
            $request->justification,
            $oldData
        );

        $activiteProjet->delete();

        return response()->json(['message' => 'Activité supprimée avec succès'], 200);
    }

    /**
     * Check if user can modify project
     */
    private function canModifyProjet($user, Projet $projet): bool
    {
        return $user->isAdmin() 
            || $user->isDirecteur() 
            || $projet->chef_projet_id === $user->id
            || $projet->personnel()->where('user_id', $user->id)->exists()
            ;
    }
}

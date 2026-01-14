<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\StoreProjetRequest;
use App\Http\Requests\UpdateProjetRequest;
use App\Http\Resources\ProjetResource;
use App\Http\Resources\UserResource;
use App\Http\Resources\PartenaireResource;
use App\Models\Projet;
use App\Models\Partenaire;
use App\Models\User;
use App\Traits\Auditable;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;
use Illuminate\Support\Facades\Storage;

class ProjetController extends Controller
{
    use Auditable;
    /**
     * Display a listing of the resource.
     */
    public function index(Request $request): AnonymousResourceCollection
    {
        $user = $request->user();
        $query = Projet::with(['chefProjet', 'activites', 'personnel.service', 'partenaires', 'services']);

        // Filtres selon le rôle
        if ($user->isChef()) {
            $query->where('chef_projet_id', $user->id)
                  ->orWhereHas('personnel', function($q) use ($user) {
                      $q->where('user_id', $user->id);
                  });
        } elseif ($user->isPersonnel()) {
            $query->whereHas('personnel', function($q) use ($user) {
                $q->where('user_id', $user->id);
            });
        } elseif ($user->isApprenant()) {
            // Lecture seule pour apprenants
        }

        // Filtres
        if ($request->has('etat')) {
            $query->where('etat', $request->etat);
        }
        if ($request->has('search')) {
            $query->where('titre', 'like', '%' . $request->search . '%');
        }
        if ($request->has('date_debut')) {
            $query->where('date_debut', '>=', $request->date_debut);
        }
        if ($request->has('date_fin')) {
            $query->where('date_fin', '<=', $request->date_fin);
        }
        if ($request->has('service_id')) {
            $query->whereHas('services', function ($q) use ($request) {
                $q->where('services.id', $request->service_id);
            });
        }

        $perPage = $request->get('per_page', 15);
        $projets = $query->orderBy('created_at', 'desc')->paginate($perPage);

        return ProjetResource::collection($projets);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(StoreProjetRequest $request): JsonResponse
    {
        $user = $request->user();
        $data = $request->validated();
        
        // Convertir email chef projet en ID
        if (isset($data['chef_projet_email'])) {
            $chefProjet = User::where('email', $data['chef_projet_email'])->first();
            $data['chef_projet_id'] = $chefProjet->id;
            unset($data['chef_projet_email']);
        } else {
            $data['chef_projet_id'] = $data['chef_projet_id'] ?? $user->id;
        }

        $data['etat'] = 'planifie';

        // Calculer la durée automatiquement
        if (isset($data['date_debut']) && isset($data['date_fin'])) {
            $dateDebut = new \DateTime($data['date_debut']);
            $dateFin = new \DateTime($data['date_fin']);
            $diff = $dateDebut->diff($dateFin);
            $data['duree'] = $diff->days;
        }

        // Gestion des images
        if ($request->hasFile('images')) {
            $images = [];
            foreach ($request->file('images') as $image) {
                $path = $image->store('projets/images', 'public');
                $images[] = Storage::url($path);
            }
            $data['images'] = $images;
        }

        // Gérer les partenaires positionnés
        $partenairesData = $data['partenaires'] ?? [];
        unset($data['partenaires']);

        // Gérer le personnel
        $personnelData = $data['personnel'] ?? [];
        unset($data['personnel']);

        // Gérer les services
        $servicesIds = $data['services'] ?? [];
        unset($data['services']);

        $projet = Projet::create($data);

        // Attacher les partenaires avec leurs rôles
        if (!empty($partenairesData)) {
            $partenairesSync = [];
            foreach ($partenairesData as $partenaireItem) {
                if (isset($partenaireItem['partenaire_id'])) {
                    $partenairesSync[$partenaireItem['partenaire_id']] = [
                        'role' => $partenaireItem['role'] ?? null,
                    ];
                }
            }
            if (!empty($partenairesSync)) {
                $projet->partenaires()->sync($partenairesSync);
            }
        }

        // Attacher le personnel avec leurs rôles
        if (!empty($personnelData)) {
            $personnelSync = [];
            foreach ($personnelData as $personnelItem) {
                if (isset($personnelItem['user_id'])) {
                    $personnelSync[$personnelItem['user_id']] = [
                        'role' => $personnelItem['role'] ?? null,
                        'date_debut' => $personnelItem['date_debut'] ?? null,
                        'date_fin' => $personnelItem['date_fin'] ?? null,
                    ];
                }
            }
            if (!empty($personnelSync)) {
                $projet->personnel()->sync($personnelSync);
            }
        }

        // Attacher les services
        if (!empty($servicesIds)) {
            $projet->services()->sync($servicesIds);
        }

        $projet->load(['chefProjet', 'activites', 'personnel', 'partenaires', 'services']);

        return response()->json([
            'message' => 'Projet créé avec succès',
            'data' => new ProjetResource($projet)
        ], 201);
    }

    /**
     * Display the specified resource.
     */
    public function show(Projet $projet): JsonResponse
    {
        $projet->load(['chefProjet', 'activites', 'medias', 'documents', 'personnel.service', 'partenaires', 'services']);
        
        return response()->json([
            'data' => new ProjetResource($projet)
        ]);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(UpdateProjetRequest $request, Projet $projet): JsonResponse
    {
        $data = $request->validated();

        // Convertir email chef projet en ID
        if (isset($data['chef_projet_email'])) {
            $chefProjet = User::where('email', $data['chef_projet_email'])->first();
            $data['chef_projet_id'] = $chefProjet->id;
            unset($data['chef_projet_email']);
        }

        // Calculer la durée automatiquement si les dates changent
        if (isset($data['date_debut']) || isset($data['date_fin'])) {
            $dateDebut = new \DateTime($data['date_debut'] ?? $projet->date_debut);
            $dateFin = new \DateTime($data['date_fin'] ?? $projet->date_fin);
            $diff = $dateDebut->diff($dateFin);
            $data['duree'] = $diff->days;
        }

        // Gestion des images
        if ($request->hasFile('images')) {
            $images = $projet->images ?? [];
            foreach ($request->file('images') as $image) {
                $path = $image->store('projets/images', 'public');
                $images[] = Storage::url($path);
            }
            $data['images'] = $images;
        }

        // Gérer les partenaires positionnés
        if (isset($data['partenaires'])) {
            $partenairesData = $data['partenaires'];
            unset($data['partenaires']);
            $partenairesSync = [];
            foreach ($partenairesData as $partenaireItem) {
                if (isset($partenaireItem['partenaire_id'])) {
                    $partenairesSync[$partenaireItem['partenaire_id']] = [
                        'role' => $partenaireItem['role'] ?? null,
                    ];
                }
            }
            $projet->partenaires()->sync($partenairesSync);
        }

        // Gérer le personnel
        if (isset($data['personnel'])) {
            $personnelData = $data['personnel'];
            unset($data['personnel']);
            $personnelSync = [];
            foreach ($personnelData as $personnelItem) {
                if (isset($personnelItem['user_id'])) {
                    $personnelSync[$personnelItem['user_id']] = [
                        'role' => $personnelItem['role'] ?? null,
                        'date_debut' => $personnelItem['date_debut'] ?? null,
                        'date_fin' => $personnelItem['date_fin'] ?? null,
                    ];
                }
            }
            $projet->personnel()->sync($personnelSync);
        }

        // Gérer les services
        if (isset($data['services'])) {
            $serviceIds = $data['services'] ?? [];
            unset($data['services']);
            $projet->services()->sync($serviceIds);
        }

        $projet->update($data);
        $projet->load(['chefProjet', 'activites', 'personnel', 'partenaires', 'services']);

        return response()->json([
            'message' => 'Projet mis à jour avec succès',
            'data' => new ProjetResource($projet)
        ]);
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(Request $request, Projet $projet): JsonResponse
    {
        $user = $request->user();
        
        // Vérifier les permissions : créateur, admin ou directeur
        $canDelete = $user->isAdmin() 
            || $user->isDirecteur() 
            || $projet->chef_projet_id === $user->id;
        
        if (!$canDelete) {
            return response()->json(['message' => 'Accès refusé'], 403);
        }

        $request->validate([
            'justification' => 'required|string|min:10',
        ]);

        $oldData = $projet->toArray();
        
        $this->logAction(
            'delete',
            Projet::class,
            $projet->id,
            $request,
            $request->justification,
            $oldData
        );

        $projet->delete();

        return response()->json(['message' => 'Projet supprimé avec succès'], 200);
    }

    /**
     * Archive a project
     */
    public function archive(Projet $projet): JsonResponse
    {
        $user = request()->user();
        
        if (!$user->isAdmin() && !$user->isDirecteur()) {
            return response()->json(['message' => 'Accès refusé'], 403);
        }

        $projet->update(['etat' => 'archive']);
        $projet->load(['chefProjet', 'activites', 'personnel', 'partenaires', 'services']);

        return response()->json([
            'message' => 'Projet archivé avec succès',
            'data' => new ProjetResource($projet)
        ]);
    }

    /**
     * Close a project
     */
    public function cloturer(Projet $projet): JsonResponse
    {
        $user = request()->user();
        
        if (!$this->canModifyProjet($user, $projet)) {
            return response()->json(['message' => 'Accès refusé'], 403);
        }

        $projet->update(['etat' => 'cloture']);
        $projet->load(['chefProjet', 'activites', 'personnel', 'partenaires', 'services']);

        return response()->json([
            'message' => 'Projet clôturé avec succès',
            'data' => new ProjetResource($projet)
        ]);
    }

    /**
     * Attach a partner to a project
     */
    public function attachPartenaire(Request $request, Projet $projet): JsonResponse
    {
        $user = request()->user();
        
        if (!$this->canModifyProjet($user, $projet)) {
            return response()->json(['message' => 'Accès refusé'], 403);
        }

        $request->validate([
            'partenaire_email' => 'required_without:partenaire_id|email|exists:partenaires,email',
            'partenaire_id' => 'required_without:partenaire_email|exists:partenaires,id',
            'role' => 'nullable|string|max:255',
            'type' => 'nullable|string|max:255',
        ]);

        $partenaireId = $request->partenaire_id;
        if ($request->has('partenaire_email')) {
            $partenaire = Partenaire::where('email', $request->partenaire_email)->first();
            $partenaireId = $partenaire->id;
        }

        $projet->partenaires()->syncWithoutDetaching([
            $partenaireId => [
                'role' => $request->role,
                'type' => $request->type,
            ]
        ]);

        $projet->load('partenaires');

        return response()->json([
            'message' => 'Partenaire ajouté avec succès',
            'data' => new ProjetResource($projet)
        ]);
    }

    /**
     * Detach a partner from a project
     */
    public function detachPartenaire(Projet $projet, Partenaire $partenaire): JsonResponse
    {
        $user = request()->user();
        
        if (!$this->canModifyProjet($user, $projet)) {
            return response()->json(['message' => 'Accès refusé'], 403);
        }

        $projet->partenaires()->detach($partenaire->id);

        return response()->json(['message' => 'Partenaire retiré avec succès']);
    }

    /**
     * Attach personnel to a project
     */
    public function attachPersonnel(Request $request, Projet $projet): JsonResponse
    {
        $user = request()->user();
        
        if (!$this->canModifyProjet($user, $projet)) {
            return response()->json(['message' => 'Accès refusé'], 403);
        }

        $request->validate([
            'user_email' => 'required_without:user_id|email|exists:users,email',
            'user_id' => 'required_without:user_email|exists:users,id',
            'role' => 'required|string|max:255',
            'date_debut' => 'required|date',
            'date_fin' => 'nullable|date|after:date_debut',
        ]);

        $userId = $request->user_id;
        if ($request->has('user_email')) {
            $user = User::where('email', $request->user_email)->first();
            $userId = $user->id;
        }

        $projet->personnel()->syncWithoutDetaching([
            $userId => [
                'role' => $request->role,
                'date_debut' => $request->date_debut,
                'date_fin' => $request->date_fin,
            ]
        ]);

        $projet->load('personnel');

        return response()->json([
            'message' => 'Personnel ajouté avec succès',
            'data' => new ProjetResource($projet)
        ]);
    }

    /**
     * Detach personnel from a project
     */
    public function detachPersonnel(Projet $projet, User $user): JsonResponse
    {
        $userRequest = request()->user();
        
        if (!$this->canModifyProjet($userRequest, $projet)) {
            return response()->json(['message' => 'Accès refusé'], 403);
        }

        $projet->personnel()->detach($user->id);

        return response()->json(['message' => 'Personnel retiré avec succès']);
    }

    /**
     * Check if user can modify project
     */
    private function canModifyProjet($user, Projet $projet): bool
    {
        return $user->isAdmin() 
            || $user->isDirecteur() 
            || $projet->chef_projet_id === $user->id;
    }
}

<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\StoreProjetRequest;
use App\Http\Requests\UpdateProjetRequest;
use App\Http\Resources\ProjetResource;
use App\Http\Resources\UserResource;
use App\Http\Resources\CategorieResource;
use App\Models\Projet;
use App\Models\Categorie;
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
        $query = Projet::with(['chefProjet', 'activites', 'personnel', 'partenaires']);

        // Filtres selon le rôle
        if ($user->role === 'chef_projet') {
            $query->where('chef_projet_id', $user->id)
                  ->orWhereHas('personnel', function($q) use ($user) {
                      $q->where('user_id', $user->id);
                  });
        } elseif ($user->role === 'personnel') {
            $query->whereHas('personnel', function($q) use ($user) {
                $q->where('user_id', $user->id);
            });
        } elseif ($user->role === 'partenaire') {
            // Partenaires voient les projets où ils sont chef de projet ou partenaire
            $query->where(function($q) use ($user) {
                $q->where('chef_projet_id', $user->id)
                  ->orWhereHas('partenaires', function($q2) use ($user) {
                      $q2->where('partenaires.id', $user->id);
                  });
            });
        } elseif ($user->role === 'consultation') {
            // Lecture seule pour consultation
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

        $perPage = $request->get('per_page', 15);
        $projets = $query->orderBy('created_at', 'desc')->paginate($perPage);

        return ProjetResource::collection($projets);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(StoreProjetRequest $request): JsonResponse
    {
        $data = $request->validated();

        $data['etat'] = 'planifie';

        // Gestion des images
        if ($request->hasFile('images')) {
            $images = [];
            foreach ($request->file('images') as $image) {
                $path = $image->store('projets/images', 'public');
                $images[] = Storage::url($path);
            }
            $data['images'] = $images;
        }

        $partenaires = $data['partenaires'] ?? [];
        unset($data['partenaires']);

        $personnel = $data['personnel'] ?? [];
        unset($data['personnel']);

        $projet = Projet::create($data);

        if (!empty($partenaires)) {
            $projet->partenaires()->sync(collect($partenaires)->mapWithKeys(function ($partenaire) {
                return [$partenaire['id'] => ['role' => $partenaire['role']]];
            }));
        }

        if (!empty($personnel)) {
            $projet->personnel()->sync(collect($personnel)->mapWithKeys(function ($membre) {
                return [$membre['id'] => ['role' => $membre['role']]];
            }));
        }

        $projet->load(['chefProjet', 'activites', 'personnel', 'partenaires']);

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
        $projet->load(['chefProjet', 'activites', 'medias', 'documents', 'personnel', 'partenaires']);
        
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

        // Gestion des images
        if ($request->hasFile('images')) {
            $images = $projet->images ?? [];
            foreach ($request->file('images') as $image) {
                $path = $image->store('projets/images', 'public');
                $images[] = Storage::url($path);
            }
            $data['images'] = $images;
        }

        if (isset($data['partenaires'])) {
            $projet->partenaires()->sync(collect($data['partenaires'])->mapWithKeys(function ($partenaire) {
                return [$partenaire['id'] => ['role' => $partenaire['role']]];
            }));
            unset($data['partenaires']);
        }

        if (isset($data['personnel'])) {
            $projet->personnel()->sync(collect($data['personnel'])->mapWithKeys(function ($membre) {
                return [$membre['id'] => ['role' => $membre['role']]];
            }));
            unset($data['personnel']);
        }

        $projet->update($data);
        $projet->load(['chefProjet', 'activites', 'personnel', 'partenaires']);

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
        
        $canDelete = optional($user->role)->nom === 'admin'
            || optional($user->role)->nom === 'directeur'
            || $projet->chef_projet_id === $user->id;
        
        if (!$canDelete) {
            return response()->json(['message' => 'Accès refusé'], 403);
        }

        $request->validate([
            'justification' => 'sometimes|string|min:10',
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

        return response()->json(['message' => 'Projet supprimé avec succès']);
    }

    public function archive(Request $request, Projet $projet): JsonResponse
    {
        $user = $request->user();
        if (optional($user->role)->nom !== 'admin' && optional($user->role)->nom !== 'directeur') {
            return response()->json(['message' => 'Accès refusé'], 403);
        }
        $projet->update(['etat' => 'archive']);
        return response()->json(['message' => 'Projet archivé avec succès']);
    }

    public function cloturer(Request $request, Projet $projet): JsonResponse
    {
        $user = $request->user();
        if (optional($user->role)->nom !== 'admin' && optional($user->role)->nom !== 'directeur' && $projet->chef_projet_id !== $user->id) {
            return response()->json(['message' => 'Accès refusé'], 403);
        }
        $projet->update(['etat' => 'cloture']);
        return response()->json(['message' => 'Projet clôturé avec succès']);
    }

    public function attachPersonnel(Request $request, Projet $projet): JsonResponse
    {
        $user = $request->user();
        if (optional($user->role)->nom !== 'admin' && optional($user->role)->nom !== 'directeur' && $projet->chef_projet_id !== $user->id) {
            return response()->json(['message' => 'Accès refusé'], 403);
        }

        $data = $request->validate([
            'user_id' => 'required|exists:users,id',
            'role' => 'required|string|max:255',
        ]);

        $projet->personnel()->syncWithoutDetaching([$data['user_id'] => ['role' => $data['role']]]);

        return response()->json(['message' => 'Personnel ajouté avec succès']);
    }

    public function detachPersonnel(Request $request, Projet $projet, User $user): JsonResponse
    {
        $userRequest = $request->user();
        if (optional($userRequest->role)->nom !== 'admin' && optional($userRequest->role)->nom !== 'directeur' && $projet->chef_projet_id !== $userRequest->id) {
            return response()->json(['message' => 'Accès refusé'], 403);
        }

        $projet->personnel()->detach($user->id);

        return response()->json(['message' => 'Personnel retiré avec succès']);
    }

    public function attachPartenaire(Request $request, Projet $projet): JsonResponse
    {
        $user = $request->user();
        if (optional($user->role)->nom !== 'admin' && optional($user->role)->nom !== 'directeur' && $projet->chef_projet_id !== $user->id) {
            return response()->json(['message' => 'Accès refusé'], 403);
        }

        $data = $request->validate([
            'categorie_id' => 'required|exists:categories,id',
            'role' => 'required|string|max:255',
        ]);

        $projet->partenaires()->syncWithoutDetaching([$data['categorie_id'] => ['role' => $data['role']]]);

        return response()->json(['message' => 'Partenaire ajouté avec succès']);
    }

    public function detachPartenaire(Request $request, Projet $projet, Categorie $categorie): JsonResponse
    {
        $user = $request->user();
        if (optional($user->role)->nom !== 'admin' && optional($user->role)->nom !== 'directeur' && $projet->chef_projet_id !== $user->id) {
            return response()->json(['message' => 'Accès refusé'], 403);
        }

        $projet->partenaires()->detach($categorie->id);

        return response()->json(['message' => 'Partenaire retiré avec succès']);
    }
}

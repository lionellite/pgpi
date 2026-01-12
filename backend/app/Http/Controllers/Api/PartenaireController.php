<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\StorePartenaireRequest;
use App\Http\Resources\PartenaireResource;
use App\Models\Partenaire;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;

class PartenaireController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index(Request $request): AnonymousResourceCollection
    {
        $query = Partenaire::query();

        if ($request->has('search')) {
            $query->where('nom', 'like', '%' . $request->search . '%')
                  ->orWhere('email', 'like', '%' . $request->search . '%');
        }

        if ($request->has('type')) {
            $query->where('type', $request->type);
        }

        $perPage = $request->get('per_page', 15);
        $partenaires = $query->orderBy('nom', 'asc')->paginate($perPage);

        return PartenaireResource::collection($partenaires);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(StorePartenaireRequest $request): JsonResponse
    {
        $partenaire = Partenaire::create($request->validated());
        $partenaire->load('projets');

        return response()->json([
            'message' => 'Partenaire créé avec succès',
            'data' => new PartenaireResource($partenaire)
        ], 201);
    }

    /**
     * Display the specified resource.
     */
    public function show(Partenaire $partenaire): JsonResponse
    {
        $partenaire->load('projets');
        
        return response()->json([
            'data' => new PartenaireResource($partenaire)
        ]);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(StorePartenaireRequest $request, Partenaire $partenaire): JsonResponse
    {
        $user = $request->user();
        
        if (!in_array($user->role, ['admin', 'directeur', 'chef_projet'])) {
            return response()->json(['message' => 'Accès refusé'], 403);
        }

        $partenaire->update($request->validated());
        $partenaire->load('projets');

        return response()->json([
            'message' => 'Partenaire mis à jour avec succès',
            'data' => new PartenaireResource($partenaire)
        ]);
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(Partenaire $partenaire): JsonResponse
    {
        $user = request()->user();
        
        if (!$user->isAdmin() && !$user->isDirecteur()) {
            return response()->json(['message' => 'Accès refusé'], 403);
        }

        $partenaire->delete();

        return response()->json(['message' => 'Partenaire supprimé avec succès'], 200);
    }
}

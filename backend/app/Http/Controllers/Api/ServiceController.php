<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Resources\ServiceResource;
use App\Models\Service;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;

class ServiceController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index(Request $request): AnonymousResourceCollection
    {
        $query = Service::query()->with('parent');

        if ($search = $request->get('search')) {
            $query->where(function ($q) use ($search) {
                $q->where('titre', 'like', "%{$search}%")
                    ->orWhere('code', 'like', "%{$search}%");
            });
        }

        if ($type = $request->get('type')) {
            $query->where('type', $type);
        }

        if ($statut = $request->get('statut')) {
            $query->where('statut', $statut);
        }

        $perPage = $request->get('per_page', 15);
        $services = $query->orderBy('titre')->paginate($perPage);

        return ServiceResource::collection($services);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request): JsonResponse
    {
        $user = $request->user();
        if (!$user->isAdmin() && !$user->isDirecteur()) {
            abort(403, 'Accès refusé');
        }

        $data = $request->validate([
            'id_parent' => 'nullable|exists:services,id',
            'type' => 'required|string|in:service,labo,pedagogique,recherche,workshop,division',
            'titre' => 'required|string|max:255',
            'code' => 'nullable|string|max:50',
            'date_creation' => 'nullable|date',
            'statut' => 'nullable|string|in:actif,inactif',
        ]);

        $service = Service::create($data);
        $service->load('parent');

        return response()->json([
            'message' => 'Service créé avec succès',
            'data' => new ServiceResource($service),
        ], 201);
    }

    /**
     * Display the specified resource.
     */
    public function show(Service $service): JsonResponse
    {
        $service->load('parent');

        return response()->json([
            'data' => new ServiceResource($service),
        ]);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, Service $service): JsonResponse
    {
        $user = $request->user();
        if (!$user->isAdmin() && !$user->isDirecteur()) {
            abort(403, 'Accès refusé');
        }

        $data = $request->validate([
            'id_parent' => 'nullable|exists:services,id',
            'type' => 'sometimes|required|string|in:service,labo,pedagogique,recherche,workshop,division',
            'titre' => 'sometimes|required|string|max:255',
            'code' => 'nullable|string|max:50',
            'date_creation' => 'nullable|date',
            'statut' => 'nullable|string|in:actif,inactif',
        ]);

        $service->update($data);
        $service->load('parent');

        return response()->json([
            'message' => 'Service mis à jour avec succès',
            'data' => new ServiceResource($service),
        ]);
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(Request $request, Service $service): JsonResponse
    {
        $user = $request->user();
        if (!$user->isAdmin() && !$user->isDirecteur()) {
            abort(403, 'Accès refusé');
        }

        $service->delete();

        return response()->json(['message' => 'Service supprimé avec succès']);
    }
}

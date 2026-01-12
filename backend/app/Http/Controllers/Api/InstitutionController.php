<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Resources\InstitutionResource;
use App\Models\Institution;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;

class InstitutionController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index(Request $request): AnonymousResourceCollection
    {
        $query = Institution::query();

        if ($request->has('search')) {
            $search = $request->search;
            $query->where(function($q) use ($search) {
                $q->where('nom', 'like', "%{$search}%")
                  ->orWhere('email', 'like', "%{$search}%");
            });
        }

        if ($request->has('type')) {
            $query->where('type', $request->type);
        }

        $perPage = $request->get('per_page', 15);
        $institutions = $query->orderBy('nom')->paginate($perPage);

        return InstitutionResource::collection($institutions);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request): JsonResponse
    {
        $user = $request->user();
        
        if (!in_array($user->role, ['admin', 'directeur', 'chef_projet'])) {
            abort(403, 'Accès refusé');
        }

        $request->validate([
            'nom' => 'required|string|max:255',
            'email' => 'required|email|unique:institutions,email',
            'type' => 'nullable|string|max:255',
            'telephone' => 'nullable|string|max:255',
            'adresse' => 'nullable|string',
            'description' => 'nullable|string',
        ]);

        $institution = Institution::create($request->all());

        return response()->json([
            'message' => 'Institution créée avec succès',
            'data' => new InstitutionResource($institution)
        ], 201);
    }

    /**
     * Display the specified resource.
     */
    public function show(Institution $institution): JsonResponse
    {
        return response()->json([
            'data' => new InstitutionResource($institution)
        ]);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, Institution $institution): JsonResponse
    {
        $user = $request->user();
        
        if (!in_array($user->role, ['admin', 'directeur', 'chef_projet'])) {
            abort(403, 'Accès refusé');
        }

        $request->validate([
            'nom' => 'sometimes|required|string|max:255',
            'email' => ['sometimes', 'required', 'email', 'unique:institutions,email,' . $institution->id],
            'type' => 'nullable|string|max:255',
            'telephone' => 'nullable|string|max:255',
            'adresse' => 'nullable|string',
            'description' => 'nullable|string',
        ]);

        $institution->update($request->all());

        return response()->json([
            'message' => 'Institution mise à jour avec succès',
            'data' => new InstitutionResource($institution)
        ]);
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(Institution $institution): JsonResponse
    {
        $user = request()->user();
        
        if (!$user->isAdmin() && !$user->isDirecteur()) {
            abort(403, 'Accès refusé');
        }

        $institution->delete();

        return response()->json(['message' => 'Institution supprimée avec succès'], 200);
    }
}

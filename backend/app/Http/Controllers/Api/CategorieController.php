<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Resources\CategorieResource;
use App\Models\Categorie;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class CategorieController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $query = Categorie::query();

        if ($request->has('type')) {
            $query->where('type', $request->type);
        }

        $perPage = $request->get('per_page', 15);
        $categories = $query->paginate($perPage);

        return response()->json([
            'data' => CategorieResource::collection($categories)
        ]);
    }

    public function store(Request $request): JsonResponse
    {
        $data = $request->validate([
            'module_id' => 'required|exists:modules,id',
            'user_id' => 'nullable|exists:users,id',
            'parent1_id' => 'nullable|exists:categories,id',
            'parent2_id' => 'nullable|exists:categories,id',
            'parent3_id' => 'nullable|exists:categories,id',
            'name' => 'nullable|string|max:255',
            'type' => 'required|string|max:255',
            'description' => 'nullable|string',
            'status' => 'nullable|string|max:255',
            'fichier_url' => 'nullable|string|max:255',
            'mission' => 'nullable|string|max:255',
            'vision' => 'nullable|string|max:255',
            'fondateurs' => 'nullable|string|max:255',
            'ifu' => 'nullable|string|max:255',
            'rib' => 'nullable|string|max:255',
            'cv' => 'nullable|string|max:255',
            'demande' => 'nullable|string|max:255',
            'attestion' => 'nullable|string|max:255',
            'diplome' => 'nullable|string|max:255',
            'date_debut' => 'nullable|date',
            'date_fin' => 'nullable|date',
            'is_active' => 'boolean',
        ]);

        $categorie = Categorie::create($data);

        return response()->json([
            'message' => 'Catégorie créée avec succès',
            'data' => new CategorieResource($categorie)
        ], 201);
    }

    public function show(Categorie $categorie): JsonResponse
    {
        return response()->json([
            'data' => new CategorieResource($categorie)
        ]);
    }

    public function update(Request $request, Categorie $categorie): JsonResponse
    {
        $data = $request->validate([
            'module_id' => 'sometimes|required|exists:modules,id',
            'user_id' => 'nullable|exists:users,id',
            'parent1_id' => 'nullable|exists:categories,id',
            'parent2_id' => 'nullable|exists:categories,id',
            'parent3_id' => 'nullable|exists:categories,id',
            'name' => 'nullable|string|max:255',
            'type' => 'sometimes|required|string|max:255',
            'description' => 'nullable|string',
            'status' => 'nullable|string|max:255',
            'fichier_url' => 'nullable|string|max:255',
            'mission' => 'nullable|string|max:255',
            'vision' => 'nullable|string|max:255',
            'fondateurs' => 'nullable|string|max:255',
            'ifu' => 'nullable|string|max:255',
            'rib' => 'nullable|string|max:255',
            'cv' => 'nullable|string|max:255',
            'demande' => 'nullable|string|max:255',
            'attestion' => 'nullable|string|max:255',
            'diplome' => 'nullable|string|max:255',
            'date_debut' => 'nullable|date',
            'date_fin' => 'nullable|date',
            'is_active' => 'boolean',
        ]);

        $categorie->update($data);

        return response()->json([
            'message' => 'Catégorie mise à jour avec succès',
            'data' => new CategorieResource($categorie)
        ]);
    }

    public function destroy(Categorie $categorie): JsonResponse
    {
        $categorie->delete();

        return response()->json(['message' => 'Catégorie supprimée avec succès']);
    }
}

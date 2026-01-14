<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Resources\UserResource;
use App\Models\User;
use App\Models\Role;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\Rule;

class UserController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index(Request $request): AnonymousResourceCollection
    {
        $user = $request->user();
        
        // Seuls les admins peuvent voir tous les utilisateurs
        if (!$user->isAdmin()) {
            abort(403, 'Accès refusé');
        }

        $query = User::query()->with(['service', 'role', 'departement']);

        if ($request->has('search')) {
            $search = $request->search;
            $query->where(function($q) use ($search) {
                $q->where('nom', 'like', "%{$search}%")
                  ->orWhere('prenoms', 'like', "%{$search}%")
                  ->orWhere('email', 'like', "%{$search}%");
            });
        }

        if ($request->has('role')) {
            $query->whereHas('role', function ($q) use ($request) {
                $q->where('nom', $request->role);
            });
        }

        $perPage = $request->get('per_page', 15);
        $users = $query->orderBy('nom')->orderBy('prenom')->paginate($perPage);

        return UserResource::collection($users);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request): JsonResponse
    {
        $user = $request->user();
        
        if (!$user->isAdmin()) {
            abort(403, 'Accès refusé');
        }

        $request->validate([
            'nom' => 'required|string|max:255',
            'prenom' => 'required|string|max:255',
            'email' => 'required|email|unique:users,email',
            'password' => 'required|string|min:8',
            'role' => 'required|in:admin,directeur,chef,personnel,apprenant',
            'departement_id' => 'nullable|exists:departements,id',
            'service_id' => 'nullable|exists:services,id',
        ]);

        $roleModel = Role::where('nom', $request->role)->firstOrFail();

        $newUser = User::create([
            'role_id' => $roleModel->id,
            'module_id' => $roleModel->module_id,
            'status' => 'actif',
            'nom' => $request->nom,
            'prenoms' => $request->prenom,
            'email' => $request->email,
            'password' => Hash::make($request->password),
            'departement_id' => $request->departement_id,
            'service_id' => $request->service_id,
        ]);

        return response()->json([
            'message' => 'Utilisateur créé avec succès',
            'data' => new UserResource($newUser)
        ], 201);
    }

    /**
     * Display the specified resource.
     */
    public function show(User $user): JsonResponse
    {
        $requestUser = request()->user();
        
        if (!$requestUser->isAdmin() && $requestUser->id !== $user->id) {
            abort(403, 'Accès refusé');
        }

        $user->load('service');

        return response()->json([
            'data' => new UserResource($user)
        ]);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, User $user): JsonResponse
    {
        $requestUser = $request->user();
        
        if (!$requestUser->isAdmin() && $requestUser->id !== $user->id) {
            abort(403, 'Accès refusé');
        }

        $request->validate([
            'nom' => 'sometimes|required|string|max:255',
            'prenom' => 'sometimes|required|string|max:255',
            'email' => ['sometimes', 'required', 'email', Rule::unique('users')->ignore($user->id)],
            'password' => 'nullable|string|min:8',
            'role' => ['sometimes', 'required', 'in:admin,directeur,chef,personnel,apprenant'],
            'departement_id' => 'nullable|exists:departements,id',
            'service_id' => 'nullable|exists:services,id',
        ]);

        $data = [];
        if ($request->filled('nom')) {
            $data['nom'] = $request->nom;
        }
        if ($request->filled('prenom')) {
            $data['prenoms'] = $request->prenom;
        }
        if ($request->filled('email')) {
            $data['email'] = $request->email;
        }
        if ($request->has('departement_id')) {
            $data['departement_id'] = $request->departement_id;
        }
        if ($request->has('service_id')) {
            $data['service_id'] = $request->service_id;
        }

        if ($request->filled('password')) {
            $data['password'] = Hash::make($request->password);
        }

        // Seuls les admins peuvent changer le rôle
        if ($requestUser->isAdmin() && $request->filled('role')) {
            $roleModel = Role::where('nom', $request->role)->firstOrFail();
            $data['role_id'] = $roleModel->id;
            $data['module_id'] = $roleModel->module_id;
        }

        $user->update($data);

        return response()->json([
            'message' => 'Utilisateur mis à jour avec succès',
            'data' => new UserResource($user)
        ]);
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(User $user): JsonResponse
    {
        $requestUser = request()->user();
        
        if (!$requestUser->isAdmin()) {
            abort(403, 'Accès refusé');
        }

        if ($requestUser->id === $user->id) {
            return response()->json(['message' => 'Vous ne pouvez pas supprimer votre propre compte'], 400);
        }

        $user->delete();

        return response()->json(['message' => 'Utilisateur supprimé avec succès'], 200);
    }
}

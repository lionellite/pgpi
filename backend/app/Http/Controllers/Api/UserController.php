<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Resources\UserResource;
use App\Models\User;
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
        
        if (optional($user->role)->nom !== 'admin') {
            abort(403, 'Accès refusé. Seuls les administrateurs peuvent accéder à cette page.');
        }

        $query = User::with('role');

        if ($request->has('search')) {
            $search = $request->search;
            $query->where(function($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                  ->orWhere('email', 'like', "%{$search}%");
            });
        }

        if ($request->has('role_id')) {
            $query->where('role_id', $request->role_id);
        }

        $perPage = $request->get('per_page', 15);
        $users = $query->orderBy('name')->paginate($perPage);

        return UserResource::collection($users);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request): JsonResponse
    {
        $user = $request->user();
        
        if (optional($user->role)->nom !== 'admin') {
            abort(403, 'Accès refusé');
        }

        $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|email|unique:users,email',
            'password' => 'required|string|min:8',
            'role_id' => 'required|exists:roles,id',
        ]);

        $newUser = User::create([
            'name' => $request->name,
            'email' => $request->email,
            'password' => Hash::make($request->password),
            'role_id' => $request->role_id,
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
        
        if (optional($requestUser->role)->nom !== 'admin' && $requestUser->id !== $user->id) {
            abort(403, 'Accès refusé');
        }

        return response()->json([
            'data' => new UserResource($user->load('role'))
        ]);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, User $user): JsonResponse
    {
        $requestUser = $request->user();
        
        if (optional($requestUser->role)->nom !== 'admin' && $requestUser->id !== $user->id) {
            abort(403, 'Accès refusé');
        }

        $request->validate([
            'name' => 'sometimes|required|string|max:255',
            'email' => ['sometimes', 'required', 'email', Rule::unique('users')->ignore($user->id)],
            'password' => 'nullable|string|min:8',
            'role_id' => ['sometimes', 'required', 'exists:roles,id'],
        ]);

        $data = $request->only(['name', 'email', 'role_id']);

        if ($request->filled('password')) {
            $data['password'] = Hash::make($request->password);
        }

        if (optional($requestUser->role)->nom !== 'admin' && isset($data['role_id'])) {
            unset($data['role_id']);
        }

        $user->update($data);

        return response()->json([
            'message' => 'Utilisateur mis à jour avec succès',
            'data' => new UserResource($user->load('role'))
        ]);
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(User $user): JsonResponse
    {
        $requestUser = request()->user();
        
        if (optional($requestUser->role)->nom !== 'admin') {
            abort(403, 'Accès refusé');
        }

        if ($requestUser->id === $user->id) {
            return response()->json(['message' => 'Vous ne pouvez pas supprimer votre propre compte'], 400);
        }

        $user->delete();

        return response()->json(['message' => 'Utilisateur supprimé avec succès'], 200);
    }
}

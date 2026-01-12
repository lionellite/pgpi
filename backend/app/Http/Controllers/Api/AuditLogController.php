<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Resources\AuditLogResource;
use App\Models\AuditLog;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;
use Illuminate\Support\Facades\DB;

class AuditLogController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index(Request $request): AnonymousResourceCollection
    {
        $user = $request->user();
        
        $query = AuditLog::with('user');
        
        // Filtres selon le rôle
        if ($user->role === 'chef_projet') {
            // Chef de projet voit les logs de ses projets
            $projetIds = \App\Models\Projet::where('chef_projet_id', $user->id)->pluck('id');
            $query->where(function($q) use ($projetIds) {
                $q->where(function($q2) use ($projetIds) {
                    $q2->where('model_type', 'App\Models\Projet')
                       ->whereIn('model_id', $projetIds);
                })->orWhere(function($q3) use ($projetIds) {
                    // Ou les logs des activités/médias/documents de ses projets
                    $q3->whereIn('model_type', ['App\Models\ActiviteProjet', 'App\Models\MediaProjet', 'App\Models\DocumentProjet'])
                       ->where(function($q4) use ($projetIds) {
                           $activiteIds = DB::table('activites_projets')->whereIn('projet_id', $projetIds)->pluck('id');
                           $mediaIds = DB::table('medias_projets')->whereIn('projet_id', $projetIds)->pluck('id');
                           $documentIds = DB::table('documents_projets')->whereIn('projet_id', $projetIds)->pluck('id');
                           $q4->where(function($q5) use ($activiteIds) {
                               $q5->where('model_type', 'App\Models\ActiviteProjet')
                                  ->whereIn('model_id', $activiteIds);
                           })->orWhere(function($q6) use ($mediaIds) {
                               $q6->where('model_type', 'App\Models\MediaProjet')
                                  ->whereIn('model_id', $mediaIds);
                           })->orWhere(function($q7) use ($documentIds) {
                               $q7->where('model_type', 'App\Models\DocumentProjet')
                                  ->whereIn('model_id', $documentIds);
                           });
                       });
                });
            });
        } elseif ($user->role === 'partenaire') {
            // Partenaire voit les logs des projets où il est institution initiatrice
            $projetIds = \App\Models\Projet::where('institution_initiatrice_user_id', $user->id)->pluck('id');
            $query->where('model_type', 'App\Models\Projet')
                  ->whereIn('model_id', $projetIds);
        }
        // Admin et directeur voient tout
        
        // Filtres
        if ($request->has('action')) {
            $query->where('action', $request->action);
        }
        if ($request->has('model_type')) {
            $query->where('model_type', $request->model_type);
        }
        if ($request->has('search')) {
            $search = $request->search;
            $query->where(function($q) use ($search) {
                $q->where('justification', 'like', "%{$search}%")
                  ->orWhereHas('user', function($q2) use ($search) {
                      $q2->where('nom', 'like', "%{$search}%")
                         ->orWhere('prenom', 'like', "%{$search}%")
                         ->orWhere('email', 'like', "%{$search}%");
                  });
            });
        }
        
        $perPage = $request->get('per_page', 15);
        $logs = $query->orderBy('created_at', 'desc')->paginate($perPage);
        
        return AuditLogResource::collection($logs);
    }

    /**
     * Display the specified resource.
     */
    public function show(AuditLog $auditLog): JsonResponse
    {
        $auditLog->load('user');
        
        return response()->json([
            'data' => new AuditLogResource($auditLog)
        ]);
    }
}

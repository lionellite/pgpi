<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Resources\ActiviteProjetResource;
use App\Http\Resources\ProjetResource;
use App\Models\Projet;
use App\Models\ActiviteProjet;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class DashboardController extends Controller
{
    /**
     * Get dashboard data
     */
    public function index(Request $request): JsonResponse
    {
        $user = $request->user();
        
        $query = Projet::query();
        
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
        }

        // Statistiques globales
        $totalProjets = (clone $query)->count();
        $projetsEnCours = (clone $query)->where('etat', 'en_cours')->count();
        $projetsSuspendus = (clone $query)->where('etat', 'suspendu')->count();
        $projetsClotures = (clone $query)->where('etat', 'cloture')->count();

        // Projets récents
        $projetsRecents = (clone $query)
            ->with(['chefProjet'])
            ->orderBy('created_at', 'desc')
            ->limit(5)
            ->get();

        // Activités à venir (7 prochains jours)
        $activitesAvenir = ActiviteProjet::whereHas('projet', function($q) use ($user, $query) {
            if ($user->isChef()) {
                $q->where('chef_projet_id', $user->id)
                  ->orWhereHas('personnel', function($q2) use ($user) {
                      $q2->where('user_id', $user->id);
                  });
            } elseif ($user->isPersonnel()) {
                $q->whereHas('personnel', function($q2) use ($user) {
                    $q2->where('user_id', $user->id);
                });
            } else {
                // Admin et directeur voient tout
            }
        })
        ->where('date_debut', '>=', now())
        ->where('date_debut', '<=', now()->addDays(7))
        ->with('projet')
        ->orderBy('date_debut', 'asc')
        ->get();

        // Projets avec retards
        $projetsEnRetard = (clone $query)
            ->where('etat', 'en_cours')
            ->where('date_fin', '<', now())
            ->with(['chefProjet'])
            ->get();

        // Avancement moyen
        $avancementMoyen = (clone $query)
            ->where('etat', 'en_cours')
            ->get()
            ->avg('avancement') ?? 0;

        return response()->json([
            'data' => [
                'statistiques' => [
                    'total_projets' => $totalProjets,
                    'projets_en_cours' => $projetsEnCours,
                    'projets_suspendus' => $projetsSuspendus,
                    'projets_clotures' => $projetsClotures,
                    'avancement_moyen' => round($avancementMoyen, 2),
                ],
                'projets_recents' => ProjetResource::collection($projetsRecents),
                'activites_avenir' => ActiviteProjetResource::collection($activitesAvenir),
                'projets_retard' => ProjetResource::collection($projetsEnRetard),
            ],
        ]);
    }
}

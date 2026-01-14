<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Resources\DepartementResource;
use App\Models\Departement;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;

class DepartementController extends Controller
{
    /**
     * Liste simple des départements (lecture seule).
     */
    public function index(): AnonymousResourceCollection
    {
        $departements = Departement::orderBy('nom')->get();

        return DepartementResource::collection($departements);
    }
}


<?php

use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\DashboardController;
use App\Http\Controllers\Api\ProjetController;
use App\Http\Controllers\Api\ActiviteProjetController;
use App\Http\Controllers\Api\MediaProjetController;
use App\Http\Controllers\Api\DocumentProjetController;
use App\Http\Controllers\Api\PartenaireController;
use App\Http\Controllers\Api\UserController;
use App\Http\Controllers\Api\InstitutionController;
use App\Http\Controllers\Api\ServiceController;
use App\Http\Controllers\Api\DepartementController;
use Illuminate\Support\Facades\Route;

// Routes d'authentification (publiques)
Route::post('/login', [AuthController::class, 'login']);
Route::post('/register', [AuthController::class, 'register']);
Route::post('/forgot-password', [AuthController::class, 'forgotPassword']);
Route::post('/reset-password', [AuthController::class, 'resetPassword']);

// Routes protégées par authentification
Route::middleware('auth:sanctum')->group(function () {
    Route::post('/logout', [AuthController::class, 'logout']);
    Route::get('/user', [AuthController::class, 'user']);

    // Dashboard
    Route::get('/dashboard', [DashboardController::class, 'index']);

    // Projets
    Route::apiResource('projets', ProjetController::class);
    Route::post('/projets/{projet}/archive', [ProjetController::class, 'archive']);
    Route::post('/projets/{projet}/cloturer', [ProjetController::class, 'cloturer']);

    // Activités de projet
    Route::apiResource('projets.activites', ActiviteProjetController::class)->shallow();

    // Médias de projet
    Route::apiResource('projets.medias', MediaProjetController::class)->shallow();
    Route::post('/medias/{media}/upload', [MediaProjetController::class, 'upload']);

    // Documents de projet
    Route::apiResource('projets.documents', DocumentProjetController::class)->shallow();
    Route::post('/documents/{document}/valider', [DocumentProjetController::class, 'valider']);
    Route::post('/documents/{document}/rejeter', [DocumentProjetController::class, 'rejeter']);

    // Partenaires
    Route::apiResource('partenaires', PartenaireController::class);
    Route::post('/projets/{projet}/partenaires', [ProjetController::class, 'attachPartenaire']);
    Route::delete('/projets/{projet}/partenaires/{partenaire}', [ProjetController::class, 'detachPartenaire']);

    // Services
    Route::apiResource('services', ServiceController::class);

    // Départements (lecture seule)
    Route::get('/departements', [DepartementController::class, 'index']);

    // Personnel
    Route::post('/projets/{projet}/personnel', [ProjetController::class, 'attachPersonnel']);
    Route::delete('/projets/{projet}/personnel/{user}', [ProjetController::class, 'detachPersonnel']);

    // Utilisateurs (admin seulement)
    Route::apiResource('users', UserController::class);

    // Institutions
    Route::apiResource('institutions', InstitutionController::class);

    // Téléchargement de fichiers
    Route::get('/medias/{media}/download', [MediaProjetController::class, 'download']);
    Route::get('/documents/{document}/download', [DocumentProjetController::class, 'download']);

    // Journal d'audit
    Route::get('/audit-logs', [\App\Http\Controllers\Api\AuditLogController::class, 'index']);
    Route::get('/audit-logs/{auditLog}', [\App\Http\Controllers\Api\AuditLogController::class, 'show']);
});


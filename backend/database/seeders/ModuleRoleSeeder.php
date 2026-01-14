<?php

namespace Database\Seeders;

use App\Models\Module;
use App\Models\Role;
use Illuminate\Database\Seeder;

class ModuleRoleSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Créer les modules (idempotent)
        $moduleEAE = Module::firstOrCreate(
            ['code' => 'eae'],
            [
                'nom' => 'Entreprendre à l\'école',
                'courte_description' => null,
                'longue_description' => null,
            ]
        );

        $moduleRENS = Module::firstOrCreate(
            ['code' => 'rens'],
            [
                'nom' => 'Recrutement des Enseignants',
                'courte_description' => null,
                'longue_description' => null,
            ]
        );

        // Créer les rôles pour le module EAE (idempotent)
        $adminRole = Role::firstOrCreate(
            ['nom' => 'admin', 'module_id' => $moduleEAE->id],
            [
                'permissions' => json_encode(['*']),
                'taches' => json_encode(['gestion_complete']),
            ]
        );

        $directeurRole = Role::firstOrCreate(
            ['nom' => 'directeur', 'module_id' => $moduleEAE->id],
            [
                'permissions' => json_encode(['voir_projets', 'valider_projets', 'gerer_personnel']),
                'taches' => json_encode(['supervision', 'validation']),
            ]
        );

        $chefRole = Role::firstOrCreate(
            ['nom' => 'chef', 'module_id' => $moduleEAE->id],
            [
                'permissions' => json_encode(['creer_projets', 'modifier_projets', 'gerer_activites']),
                'taches' => json_encode(['gestion_projets']),
            ]
        );

        $personnelRole = Role::firstOrCreate(
            ['nom' => 'personnel', 'module_id' => $moduleEAE->id],
            [
                'permissions' => json_encode(['voir_projets', 'ajouter_documents']),
                'taches' => json_encode(['collaboration']),
            ]
        );

        $apprenantRole = Role::firstOrCreate(
            ['nom' => 'apprenant', 'module_id' => $moduleEAE->id],
            [
                'permissions' => json_encode(['voir_projets']),
                'taches' => json_encode(['apprentissage']),
            ]
        );
    }
}

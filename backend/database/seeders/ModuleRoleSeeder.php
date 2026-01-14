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
        // Créer les modules
        $moduleEAE = Module::create([
            'code' => 'eae',
            'nom' => 'Entreprendre à l\'école',
            'courte_description' => null,
            'longue_description' => null,
        ]);

        $moduleRENS = Module::create([
            'code' => 'rens',
            'nom' => 'Recrutement des Enseignants',
            'courte_description' => null,
            'longue_description' => null,
        ]);

        // Créer les rôles pour le module EAE
        $adminRole = Role::create([
            'nom' => 'admin',
            'permissions' => json_encode(['*']),
            'taches' => json_encode(['gestion_complete']),
            'module_id' => $moduleEAE->id,
        ]);

        $directeurRole = Role::create([
            'nom' => 'directeur',
            'permissions' => json_encode(['voir_projets', 'valider_projets', 'gerer_personnel']),
            'taches' => json_encode(['supervision', 'validation']),
            'module_id' => $moduleEAE->id,
        ]);

        $chefRole = Role::create([
            'nom' => 'chef',
            'permissions' => json_encode(['creer_projets', 'modifier_projets', 'gerer_activites']),
            'taches' => json_encode(['gestion_projets']),
            'module_id' => $moduleEAE->id,
        ]);

        $personnelRole = Role::create([
            'nom' => 'personnel',
            'permissions' => json_encode(['voir_projets', 'ajouter_documents']),
            'taches' => json_encode(['collaboration']),
            'module_id' => $moduleEAE->id,
        ]);

        $apprenantRole = Role::create([
            'nom' => 'apprenant',
            'permissions' => json_encode(['voir_projets']),
            'taches' => json_encode(['apprentissage']),
            'module_id' => $moduleEAE->id,
        ]);
    }
}

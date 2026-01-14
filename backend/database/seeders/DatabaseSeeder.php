<?php

namespace Database\Seeders;

use App\Models\User;
use App\Models\Role;
use App\Models\Module;
use App\Models\Departement;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    use WithoutModelEvents;

    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        // D'abord, créer les modules et rôles
        $this->call(ModuleRoleSeeder::class);

        // Créer les départements de l'INSTI
        $departements = [
            ['nom' => 'Génie Electrique et Informatique', 'code' => 'GEI'],
            ['nom' => 'Génie Civil', 'code' => 'GC'],
            ['nom' => 'Génie Mécanique et Productique', 'code' => 'GMP'],
            ['nom' => 'Maintenance des Systèmes', 'code' => 'MS'],
            ['nom' => 'Génie Energétique', 'code' => 'GE'],
        ];

        foreach ($departements as $dep) {
            Departement::firstOrCreate(['nom' => $dep['nom']], ['code' => $dep['code']]);
        }

        // Récupérer les rôles
        $adminRole = Role::where('nom', 'admin')->first();
        $directeurRole = Role::where('nom', 'directeur')->first();
        $chefRole = Role::where('nom', 'chef')->first();
        $personnelRole = Role::where('nom', 'personnel')->first();
        $apprenantRole = Role::where('nom', 'apprenant')->first();

        // Créer des utilisateurs de test avec la nouvelle structure
        User::firstOrCreate(
            ['email' => 'admin@insti.bj'],
            [
                'role_id' => $adminRole->id,
                'name' => 'Administrateur Système',
                'password' => bcrypt('password'),
                'status' => 'actif',
                'nom' => 'Admin',
                'prenoms' => 'Système',
                'module_id' => $adminRole->module_id,
            ]
        );

        User::firstOrCreate(
            ['email' => 'directeur@insti.bj'],
            [
                'role_id' => $directeurRole->id,
                'name' => 'Directeur Général',
                'password' => bcrypt('password'),
                'status' => 'actif',
                'nom' => 'Directeur',
                'prenoms' => 'Général',
                'module_id' => $directeurRole->module_id,
            ]
        );

        User::firstOrCreate(
            ['email' => 'chef@insti.bj'],
            [
                'role_id' => $chefRole->id,
                'name' => 'John Doe',
                'password' => bcrypt('password'),
                'status' => 'actif',
                'nom' => 'Doe',
                'prenoms' => 'John',
                'module_id' => $chefRole->module_id,
            ]
        );

        User::firstOrCreate(
            ['email' => 'personnel@insti.bj'],
            [
                'role_id' => $personnelRole->id,
                'name' => 'Jane Smith',
                'password' => bcrypt('password'),
                'status' => 'actif',
                'nom' => 'Smith',
                'prenoms' => 'Jane',
                'module_id' => $personnelRole->module_id,
            ]
        );

        User::firstOrCreate(
            ['email' => 'apprenant@insti.bj'],
            [
                'role_id' => $apprenantRole->id,
                'name' => 'Test Apprenant',
                'password' => bcrypt('password'),
                'status' => 'actif',
                'nom' => 'Apprenant',
                'prenoms' => 'Test',
                'module_id' => $apprenantRole->module_id,
            ]
        );
    }
}

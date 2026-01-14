<?php

namespace Database\Seeders;

use App\Models\User;
use App\Models\Role;
use App\Models\Module;
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

        // Récupérer les rôles
        $adminRole = Role::where('nom', 'admin')->first();
        $directeurRole = Role::where('nom', 'directeur')->first();
        $chefRole = Role::where('nom', 'chef')->first();
        $personnelRole = Role::where('nom', 'personnel')->first();
        $apprenantRole = Role::where('nom', 'apprenant')->first();

        // Créer des utilisateurs de test avec la nouvelle structure
        User::create([
            'role_id' => $adminRole->id,
            'name' => 'Administrateur Système',
            'email' => 'admin@insti.bj',
            'password' => bcrypt('password'),
            'status' => 'actif',
            'nom' => 'Admin',
            'prenoms' => 'Système',
            'module_id' => $adminRole->module_id,
        ]);

        User::create([
            'role_id' => $directeurRole->id,
            'name' => 'Directeur Général',
            'email' => 'directeur@insti.bj',
            'password' => bcrypt('password'),
            'status' => 'actif',
            'nom' => 'Directeur',
            'prenoms' => 'Général',
            'module_id' => $directeurRole->module_id,
        ]);

        User::create([
            'role_id' => $chefRole->id,
            'name' => 'John Doe',
            'email' => 'chef@insti.bj',
            'password' => bcrypt('password'),
            'status' => 'actif',
            'nom' => 'Doe',
            'prenoms' => 'John',
            'module_id' => $chefRole->module_id,
        ]);

        User::create([
            'role_id' => $personnelRole->id,
            'name' => 'Jane Smith',
            'email' => 'personnel@insti.bj',
            'password' => bcrypt('password'),
            'status' => 'actif',
            'nom' => 'Smith',
            'prenoms' => 'Jane',
            'module_id' => $personnelRole->module_id,
        ]);

        User::create([
            'role_id' => $apprenantRole->id,
            'name' => 'Test Apprenant',
            'email' => 'apprenant@insti.bj',
            'password' => bcrypt('password'),
            'status' => 'actif',
            'nom' => 'Apprenant',
            'prenoms' => 'Test',
            'module_id' => $apprenantRole->module_id,
        ]);
    }
}

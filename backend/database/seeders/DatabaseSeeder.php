<?php

namespace Database\Seeders;

use App\Models\Module;
use App\Models\Role;
use App\Models\User;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class DatabaseSeeder extends Seeder
{
    use WithoutModelEvents;

    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        // 1. Créer les modules
        $moduleProjets = Module::firstOrCreate(
            ['code' => 'pgpi'],
            ['nom' => 'Projet de Gestion de Projets Institutionnels']
        );

        // 2. Créer les rôles en les associant au module
        $roleAdmin = Role::firstOrCreate(['nom' => 'admin', 'module_id' => $moduleProjets->id]);
        $roleDirecteur = Role::firstOrCreate(['nom' => 'directeur', 'module_id' => $moduleProjets->id]);
        $roleChefProjet = Role::firstOrCreate(['nom' => 'chef_projet', 'module_id' => $moduleProjets->id]);
        $rolePersonnel = Role::firstOrCreate(['nom' => 'personnel', 'module_id' => $moduleProjets->id]);

        // 3. Créer les utilisateurs avec la nouvelle structure
        User::firstOrCreate(
            ['email' => 'admin@insti.bj'],
            [
                'name' => 'Admin Système',
                'nom' => 'Admin',
                'prenoms' => 'Système',
                'password' => Hash::make('password'),
                'role_id' => $roleAdmin->id,
                'status' => 'active',
            ]
        );

        User::firstOrCreate(
            ['email' => 'directeur@insti.bj'],
            [
                'name' => 'Directeur Général',
                'nom' => 'Directeur',
                'prenoms' => 'Général',
                'password' => Hash::make('password'),
                'role_id' => $roleDirecteur->id,
                'status' => 'active',
            ]
        );

        User::firstOrCreate(
            ['email' => 'chef.projet@insti.bj'],
            [
                'name' => 'John Doe',
                'nom' => 'Doe',
                'prenoms' => 'John',
                'password' => Hash::make('password'),
                'role_id' => $roleChefProjet->id,
                'status' => 'active',
            ]
        );

        User::firstOrCreate(
            ['email' => 'personnel@insti.bj'],
            [
                'name' => 'Jane Smith',
                'nom' => 'Smith',
                'prenoms' => 'Jane',
                'password' => Hash::make('password'),
                'role_id' => $rolePersonnel->id,
                'status' => 'active',
            ]
        );
    }
}

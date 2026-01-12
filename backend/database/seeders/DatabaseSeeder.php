<?php

namespace Database\Seeders;

use App\Models\User;
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
        // Créer des utilisateurs de test avec différents rôles
        User::create([
            'nom' => 'Admin',
            'prenom' => 'Système',
            'email' => 'admin@insti.bj',
            'password' => bcrypt('password'),
            'role' => 'admin',
            'departement' => 'Informatique',
        ]);

        User::create([
            'nom' => 'Directeur',
            'prenom' => 'Général',
            'email' => 'directeur@insti.bj',
            'password' => bcrypt('password'),
            'role' => 'directeur',
            'departement' => 'Direction',
        ]);

        User::create([
            'nom' => 'Doe',
            'prenom' => 'John',
            'email' => 'chef.projet@insti.bj',
            'password' => bcrypt('password'),
            'role' => 'chef_projet',
            'departement' => 'Projets',
        ]);

        User::create([
            'nom' => 'Smith',
            'prenom' => 'Jane',
            'email' => 'personnel@insti.bj',
            'password' => bcrypt('password'),
            'role' => 'personnel',
            'departement' => 'Enseignement',
        ]);
    }
}

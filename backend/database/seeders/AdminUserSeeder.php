<?php

namespace Database\Seeders;

use App\Models\Role;
use App\Models\User;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class AdminUserSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Créer un rôle admin s'il n'existe pas
        $adminRole = Role::firstOrCreate(
            ['nom' => 'admin'],
            [
                'permissions' => json_encode(['*']),
                'taches' => json_encode([]),
                'module_id' => null
            ]
        );

        // Créer l'utilisateur admin s'il n'existe pas
        User::firstOrCreate(
            ['email' => 'admin@example.com'],
            [
                'name' => 'Administrateur',
                'password' => Hash::make('password'),
                'role_id' => $adminRole->id,
                'status' => 'actif',
                'nom' => 'Admin',
                'prenoms' => 'System',
            ]
        );
    }
}

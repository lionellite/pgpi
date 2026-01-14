<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        // Désactiver temporairement les contraintes de clé étrangère
        DB::statement('PRAGMA foreign_keys = OFF');

        // Créer une table temporaire pour sauvegarder les données
        if (!Schema::hasTable('users_temp')) {
            Schema::create('users_temp', function (Blueprint $table) {
                $table->id();
                $table->string('name')->nullable();
                $table->string('email')->unique();
                $table->string('password');
                $table->foreignId('role_id')->nullable()->constrained('roles')->onDelete('set null');
                $table->foreignId('module_id')->nullable()->constrained('modules')->onDelete('set null');
                $table->string('status')->default('actif');
                $table->string('photo_url')->nullable();
                $table->string('sexe', 1)->nullable();
                $table->string('nom')->nullable();
                $table->string('prenoms')->nullable();
                $table->timestamp('date_inscription')->useCurrent();
                $table->timestamp('last_login_at')->nullable();
                $table->rememberToken();
                $table->timestamps();
            });
        }

        // Copier les données existantes si la table users existe
        if (Schema::hasTable('users')) {
            $columns = Schema::getColumnListing('users');

            // Créer la requête d'insertion
            $selectColumns = [];
            $insertColumns = [
                'id', 'name', 'email', 'password', 'role_id', 'module_id',
                'status', 'photo_url', 'sexe', 'nom', 'prenoms',
                'date_inscription', 'last_login_at', 'remember_token',
                'created_at', 'updated_at'
            ];

            // Ne sélectionner que les colonnes qui existent dans la table source
            foreach ($insertColumns as $col) {
                if (in_array($col, $columns)) {
                    $selectColumns[] = $col;
                } else {
                    $selectColumns[] = 'NULL as ' . $col;
                }
            }

            $selectSql = 'SELECT ' . implode(', ', $selectColumns) . ' FROM users';

            DB::insert('INSERT INTO users_temp (' . implode(', ', $insertColumns) . ') ' . $selectSql);

            // Supprimer l'ancienne table
            Schema::dropIfExists('users');
        }

        // Renommer la table temporaire
        Schema::rename('users_temp', 'users');

        // Réactiver les contraintes de clé étrangère
        DB::statement('PRAGMA foreign_keys = ON');
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        // Cette migration est difficile à annuler, donc on laisse vide
        // Une sauvegarde de la base de données est recommandée avant d'exécuter cette migration
    }
};

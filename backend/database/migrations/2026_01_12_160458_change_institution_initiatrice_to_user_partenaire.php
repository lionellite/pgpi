<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        // Supprimer l'ancienne clé étrangère et colonne
        Schema::table('projets', function (Blueprint $table) {
            $table->dropForeign(['institution_initiatrice_id']);
            $table->dropColumn('institution_initiatrice_id');
        });

        // Ajouter la nouvelle colonne pointant vers users
        Schema::table('projets', function (Blueprint $table) {
            $table->foreignId('institution_initiatrice_user_id')
                  ->nullable()
                  ->after('chef_projet_id')
                  ->constrained('users')
                  ->onDelete('set null')
                  ->comment('Utilisateur partenaire qui initie le projet');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('projets', function (Blueprint $table) {
            $table->dropForeign(['institution_initiatrice_user_id']);
            $table->dropColumn('institution_initiatrice_user_id');
        });

        Schema::table('projets', function (Blueprint $table) {
            $table->foreignId('institution_initiatrice_id')
                  ->nullable()
                  ->after('chef_projet_id')
                  ->constrained('institutions')
                  ->onDelete('set null');
        });
    }
};

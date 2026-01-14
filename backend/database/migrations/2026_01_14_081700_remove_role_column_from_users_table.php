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
        // Vérifier si la colonne existe avant de la supprimer
        if (Schema::hasColumn('users', 'role')) {
            Schema::table('users', function (Blueprint $table) {
                $table->dropColumn('role');
            });
        }
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        // Si vous avez besoin de restaurer la colonne
        Schema::table('users', function (Blueprint $table) {
            $table->enum('role', ['admin', 'directeur', 'chef', 'personnel', 'apprenant'])->default('personnel');
        });
    }
};

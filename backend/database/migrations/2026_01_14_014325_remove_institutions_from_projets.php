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
        Schema::table('projets', function (Blueprint $table) {
            // Supprimer les colonnes liées aux institutions
            if (Schema::hasColumn('projets', 'institution_initiatrice_user_id')) {
                $table->dropForeign(['institution_initiatrice_user_id']);
                $table->dropColumn('institution_initiatrice_user_id');
            }
        });
        
        // Supprimer la table pivot institution_projet si elle existe
        if (Schema::hasTable('institution_projet')) {
            Schema::dropIfExists('institution_projet');
        }
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('projets', function (Blueprint $table) {
            $table->foreignId('institution_initiatrice_user_id')->nullable()->after('chef_projet_id')->constrained('users')->onDelete('set null');
        });
    }
};

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
        Schema::create('activite_projet', function (Blueprint $table) {
            $table->id();
            $table->foreignId('projet_id')->constrained('projets')->onDelete('cascade');
            $table->string('titre');
            $table->date('date_debut');
            $table->date('date_fin');
            $table->text('activit_mene')->nullable();
            $table->json('data')->nullable(); // Données JSON libres
            $table->integer('duree_activite')->nullable();
            $table->text('description')->nullable();
            $table->enum('etat', ['planifie', 'en_cours', 'termine', 'suspendu'])->default('planifie');
            $table->enum('type', ['atelier', 'construction', 'acquisition', 'formation', 'recherche', 'autre'])->default('autre');
            $table->integer('avancement')->default(0); // Pourcentage 0-100
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('activite_projet');
    }
};

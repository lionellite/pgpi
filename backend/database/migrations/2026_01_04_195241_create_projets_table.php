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
        Schema::create('projets', function (Blueprint $table) {
            $table->id();
            $table->string('titre');
            $table->date('date_debut');
            $table->date('date_fin');
            $table->text('objectif_general');
            $table->text('objectifs_specifiques')->nullable();
            $table->text('description')->nullable();
            $table->json('images')->nullable(); // Array d'URLs d'images
            $table->enum('etat', ['planifie', 'en_cours', 'suspendu', 'cloture', 'archive'])->default('planifie');
            $table->foreignId('chef_projet_id')->nullable()->constrained('users')->onDelete('set null');
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('projets');
    }
};

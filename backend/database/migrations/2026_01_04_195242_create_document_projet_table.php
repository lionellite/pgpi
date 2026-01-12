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
        Schema::create('document_projet', function (Blueprint $table) {
            $table->id();
            $table->foreignId('projet_id')->constrained('projets')->onDelete('cascade');
            $table->string('titre');
            $table->text('description')->nullable();
            $table->enum('type', ['rapport', 'budget', 'technique', 'administratif', 'autre'])->default('autre');
            $table->enum('etat', ['brouillon', 'en_attente', 'valide', 'rejete'])->default('brouillon');
            $table->string('chemin_fichier'); // Chemin vers le fichier
            $table->string('nom_fichier'); // Nom original du fichier
            $table->string('mime_type')->nullable();
            $table->integer('taille')->nullable(); // Taille en bytes
            $table->integer('version')->default(1);
            $table->foreignId('derniere_mise_a_jour_par')->nullable()->constrained('users')->onDelete('set null');
            $table->timestamp('derniere_mise_a_jour')->nullable();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('document_projet');
    }
};

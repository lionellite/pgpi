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
        Schema::create('media_projet', function (Blueprint $table) {
            $table->id();
            $table->foreignId('projet_id')->constrained('projets')->onDelete('cascade');
            $table->string('titre')->nullable();
            $table->text('description')->nullable();
            $table->enum('type', ['image', 'video', 'audio', 'document'])->default('image');
            $table->string('chemin_fichier'); // Chemin vers le fichier
            $table->string('nom_fichier'); // Nom original du fichier
            $table->string('mime_type')->nullable();
            $table->integer('taille')->nullable(); // Taille en bytes
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('media_projet');
    }
};

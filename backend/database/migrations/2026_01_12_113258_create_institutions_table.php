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
        Schema::create('institutions', function (Blueprint $table) {
            $table->id();
            $table->string('nom');
            $table->string('email')->unique();
            $table->string('type')->nullable(); // université, entreprise, ONG, etc.
            $table->string('telephone')->nullable();
            $table->text('adresse')->nullable();
            $table->text('description')->nullable();
            $table->timestamps();
        });

        // Table pivot pour les institutions liées aux projets
        Schema::create('institution_projet', function (Blueprint $table) {
            $table->id();
            $table->foreignId('projet_id')->constrained('projets')->onDelete('cascade');
            $table->foreignId('institution_id')->constrained('institutions')->onDelete('cascade');
            $table->string('role')->nullable(); // partenaire, collaborateur, etc.
            $table->timestamps();
            
            $table->unique(['projet_id', 'institution_id']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('institution_projet');
        Schema::dropIfExists('institutions');
    }
};

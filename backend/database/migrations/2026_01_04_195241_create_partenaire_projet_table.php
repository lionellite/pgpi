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
        Schema::create('partenaire_projet', function (Blueprint $table) {
            $table->id();
            $table->foreignId('projet_id')->constrained('projets')->onDelete('cascade');
            $table->foreignId('partenaire_id')->constrained('partenaires')->onDelete('cascade');
            $table->string('role')->nullable(); // Partenaire financier, technique, etc.
            $table->string('type')->nullable(); // Type de partenariat
            $table->timestamps();
            
            $table->unique(['projet_id', 'partenaire_id']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('partenaire_projet');
    }
};

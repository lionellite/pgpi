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
        Schema::create('audit_logs', function (Blueprint $table) {
            $table->id();
            $table->string('action'); // create, update, delete
            $table->string('model_type'); // Projet, DocumentProjet, MediaProjet, ActiviteProjet, etc.
            $table->unsignedBigInteger('model_id');
            $table->foreignId('user_id')->constrained('users')->onDelete('cascade');
            $table->text('justification')->nullable(); // Raison de la suppression
            $table->json('old_values')->nullable(); // Données avant suppression
            $table->json('new_values')->nullable(); // Données après modification
            $table->string('ip_address')->nullable();
            $table->string('user_agent')->nullable();
            $table->timestamps();
            
            $table->index(['model_type', 'model_id']);
            $table->index('user_id');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('audit_logs');
    }
};

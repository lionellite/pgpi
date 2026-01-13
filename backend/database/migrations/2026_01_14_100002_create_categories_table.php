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
        Schema::create('categories', function (Blueprint $table) {
            $table->id();
            $table->foreignId('module_id')->constrained('modules')->onDelete('cascade');
            $table->foreignId('user_id')->nullable()->constrained('users')->onDelete('set null');
            $table->foreignId('parent1_id')->nullable()->constrained('categories')->onDelete('set null');
            $table->foreignId('parent2_id')->nullable()->constrained('categories')->onDelete('set null');
            $table->foreignId('parent3_id')->nullable()->constrained('categories')->onDelete('set null');
            $table->string('name')->nullable();
            $table->string('type');
            $table->text('description')->nullable();
            $table->string('status')->nullable();
            $table->string('fichier_url')->nullable();
            $table->string('mission')->nullable();
            $table->string('vision')->nullable();
            $table->string('fondateurs')->nullable();
            $table->string('ifu')->nullable();
            $table->string('rib')->nullable();
            $table->string('cv')->nullable();
            $table->string('demande')->nullable();
            $table->string('attestion')->nullable();
            $table->string('diplome')->nullable();
            $table->date('date_debut')->nullable();
            $table->date('date_fin')->nullable();
            $table->boolean('is_active')->default(true);
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('categories');
    }
};

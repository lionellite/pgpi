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
        Schema::table('partenaires', function (Blueprint $table) {
            $table->string('point_contact')->nullable()->after('nom');
            $table->string('localisation')->nullable()->after('point_contact');
            $table->string('logo')->nullable()->after('localisation');
            // Garder les champs existants : nom, type, email, telephone, adresse, description
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('partenaires', function (Blueprint $table) {
            $table->dropColumn(['point_contact', 'localisation', 'logo']);
        });
    }
};

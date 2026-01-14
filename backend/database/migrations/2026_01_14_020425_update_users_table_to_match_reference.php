<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::table('users', function (Blueprint $table) {
            // Supprimer les colonnes existantes qui ne correspondent pas
            if (Schema::hasColumn('users', 'nom')) {
                $table->dropColumn('nom');
            }
            if (Schema::hasColumn('users', 'prenom')) {
                $table->dropColumn('prenom');
            }
            if (Schema::hasColumn('users', 'role')) {
                $table->dropColumn('role');
            }
            if (Schema::hasColumn('users', 'departement')) {
                $table->dropColumn('departement');
            }
            if (Schema::hasColumn('users', 'email_verified_at')) {
                $table->dropColumn('email_verified_at');
            }
            if (Schema::hasColumn('users', 'remember_token')) {
                $table->dropRememberToken();
            }
        });

        Schema::table('users', function (Blueprint $table) {
            // Ajouter les nouvelles colonnes selon la structure de référence
            $table->foreignId('role_id')->nullable()->after('id')->constrained('roles')->onDelete('set null');
            $table->string('name')->after('role_id');
            $table->string('status')->nullable()->after('password');
            $table->string('photo_url')->nullable()->after('status');
            $table->string('sexe')->nullable()->after('photo_url');
            $table->string('nom')->nullable()->after('sexe');
            $table->string('prenoms')->nullable()->after('nom'); // Note: "prenoms" au pluriel
            $table->timestamp('date_inscription')->useCurrent()->after('prenoms');
            $table->timestamp('last_login_at')->nullable()->after('date_inscription');
            $table->foreignId('module_id')->nullable()->after('updated_at')->constrained('modules')->onDelete('set null');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('users', function (Blueprint $table) {
            // Supprimer les colonnes ajoutées
            if (Schema::hasColumn('users', 'role_id')) {
                $table->dropForeign(['role_id']);
                $table->dropColumn('role_id');
            }
            if (Schema::hasColumn('users', 'name')) {
                $table->dropColumn('name');
            }
            if (Schema::hasColumn('users', 'status')) {
                $table->dropColumn('status');
            }
            if (Schema::hasColumn('users', 'photo_url')) {
                $table->dropColumn('photo_url');
            }
            if (Schema::hasColumn('users', 'sexe')) {
                $table->dropColumn('sexe');
            }
            if (Schema::hasColumn('users', 'prenoms')) {
                $table->dropColumn('prenoms');
            }
            if (Schema::hasColumn('users', 'date_inscription')) {
                $table->dropColumn('date_inscription');
            }
            if (Schema::hasColumn('users', 'last_login_at')) {
                $table->dropColumn('last_login_at');
            }
            if (Schema::hasColumn('users', 'module_id')) {
                $table->dropForeign(['module_id']);
                $table->dropColumn('module_id');
            }
        });

        Schema::table('users', function (Blueprint $table) {
            // Restaurer les colonnes originales
            $table->string('nom')->after('email');
            $table->string('prenom')->after('nom');
            $table->enum('role', ['admin', 'directeur', 'chef_projet', 'personnel', 'partenaire', 'consultation'])->default('personnel')->after('password');
            $table->string('departement')->nullable()->after('role');
            $table->timestamp('email_verified_at')->nullable()->after('email');
            $table->rememberToken();
        });
    }
};

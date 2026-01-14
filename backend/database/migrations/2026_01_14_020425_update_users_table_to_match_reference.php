<?php

use Illuminate\Database\Migrations\Migration;

return new class extends Migration
{
    /**
     * Run the migrations.
     *
     * Cette migration est désormais un NO-OP (aucune modification),
     * car la structure de la table `users` a déjà été alignée avec
     * la base de référence par les migrations ultérieures
     * (`fix_users_table`, etc.).
     */
    public function up(): void
    {
        // Pas de changement supplémentaire sur la table `users`
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        // Rien à annuler : migration neutre
    }
};

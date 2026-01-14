<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Projet extends Model
{
    protected $fillable = [
        'titre',
        'date_debut',
        'date_fin',
        'objectif_general',
        'objectifs_specifiques',
        'descriptions',
        'images',
        'duree',
        'etat',
        'chef_projet_id',
    ];

    protected function casts(): array
    {
        return [
            'date_debut' => 'date',
            'date_fin' => 'date',
            'images' => 'array',
        ];
    }

    // Relations
    public function chefProjet(): BelongsTo
    {
        return $this->belongsTo(User::class, 'chef_projet_id');
    }

    public function activites(): HasMany
    {
        return $this->hasMany(ActiviteProjet::class);
    }

    public function medias(): HasMany
    {
        return $this->hasMany(MediaProjet::class);
    }

    public function documents(): HasMany
    {
        return $this->hasMany(DocumentProjet::class);
    }

    public function partenaires(): BelongsToMany
    {
        return $this->belongsToMany(Partenaire::class, 'partenaire_projet', 'projet_id', 'partenaire_id')
            ->withPivot('role', 'type')
            ->withTimestamps();
    }

    public function personnel(): BelongsToMany
    {
        return $this->belongsToMany(User::class, 'personnel_projet', 'projet_id', 'user_id')
            ->withPivot('role', 'date_debut', 'date_fin')
            ->withTimestamps();
    }


    // Helpers
    public function getAvancementAttribute(): int
    {
        $activites = $this->activites;
        if ($activites->isEmpty()) {
            return 0;
        }
        return (int) $activites->avg('avancement');
    }
}

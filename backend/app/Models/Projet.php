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
        'description',
        'images',
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
        return $this->belongsToMany(Categorie::class, 'categorie_projet', 'projet_id', 'categorie_id')
            ->withPivot('role')
            ->withTimestamps();
    }

    public function personnel(): BelongsToMany
    {
        return $this->belongsToMany(User::class, 'personnel_projet', 'projet_id', 'user_id')
            ->withPivot('role', 'date_debut', 'date_fin')
            ->withTimestamps();
    }

    // Helpers
    public function getDureeAttribute(): ?string
    {
        if ($this->date_debut && $this->date_fin) {
            return $this->date_debut->diff($this->date_fin)->format('%y années, %m mois, %d jours');
        }
        return null;
    }

    public function getAvancementAttribute(): int
    {
        $activites = $this->activites;
        if ($activites->isEmpty()) {
            return 0;
        }
        return (int) $activites->avg('avancement');
    }
}

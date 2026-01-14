<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\HasManyThrough;

class Service extends Model
{
    protected $fillable = [
        'id_parent',
        'type',
        'titre',
        'code',
        'date_creation',
        'statut',
    ];

    protected function casts(): array
    {
        return [
            'date_creation' => 'date',
        ];
    }

    // Relations
    public function parent(): BelongsTo
    {
        return $this->belongsTo(Service::class, 'id_parent');
    }

    public function enfants(): HasMany
    {
        return $this->hasMany(Service::class, 'id_parent');
    }

    public function personnels(): HasMany
    {
        return $this->hasMany(User::class, 'service_id');
    }

    public function gerants(): HasMany
    {
        return $this->hasMany(ServiceGerant::class, 'service_id');
    }

    public function gerantsActifs(): HasMany
    {
        return $this->hasMany(ServiceGerant::class, 'service_id')
            ->where('statut', 'actif');
    }

    public function projets(): \Illuminate\Database\Eloquent\Relations\BelongsToMany
    {
        return $this->belongsToMany(Projet::class, 'projet_service', 'service_id', 'projet_id')
            ->withTimestamps();
    }
}

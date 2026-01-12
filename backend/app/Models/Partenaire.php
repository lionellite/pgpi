<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;

class Partenaire extends Model
{
    protected $fillable = [
        'nom',
        'type',
        'email',
        'telephone',
        'adresse',
        'description',
    ];

    public function projets(): BelongsToMany
    {
        return $this->belongsToMany(Projet::class, 'partenaire_projet', 'partenaire_id', 'projet_id')
            ->withPivot('role', 'type')
            ->withTimestamps();
    }
}

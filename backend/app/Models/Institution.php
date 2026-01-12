<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;

class Institution extends Model
{
    protected $fillable = [
        'nom',
        'email',
        'type',
        'telephone',
        'adresse',
        'description',
    ];

    public function projets(): BelongsToMany
    {
        return $this->belongsToMany(Projet::class, 'institution_projet', 'institution_id', 'projet_id')
            ->withPivot('role')
            ->withTimestamps();
    }
}

<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class ActiviteProjet extends Model
{
    protected $table = 'activite_projet';

    protected $fillable = [
        'projet_id',
        'titre',
        'date_debut',
        'date_fin',
        'activit_mene',
        'data',
        'duree_activite',
        'description',
        'etat',
        'type',
        'avancement',
    ];

    protected function casts(): array
    {
        return [
            'date_debut' => 'date',
            'date_fin' => 'date',
            'data' => 'array',
            'avancement' => 'integer',
        ];
    }

    public function projet(): BelongsTo
    {
        return $this->belongsTo(Projet::class);
    }
}

<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class MediaProjet extends Model
{
    protected $table = 'media_projet';

    protected $fillable = [
        'projet_id',
        'titre',
        'description',
        'type',
        'chemin_fichier',
        'nom_fichier',
        'mime_type',
        'taille',
    ];

    public function projet(): BelongsTo
    {
        return $this->belongsTo(Projet::class);
    }
}

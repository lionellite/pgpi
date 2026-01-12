<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class DocumentProjet extends Model
{
    protected $table = 'document_projet';

    protected $fillable = [
        'projet_id',
        'titre',
        'description',
        'type',
        'etat',
        'chemin_fichier',
        'nom_fichier',
        'mime_type',
        'taille',
        'version',
        'derniere_mise_a_jour_par',
        'derniere_mise_a_jour',
    ];

    protected function casts(): array
    {
        return [
            'derniere_mise_a_jour' => 'datetime',
            'version' => 'integer',
        ];
    }

    public function projet(): BelongsTo
    {
        return $this->belongsTo(Projet::class);
    }

    public function dernierModificateur(): BelongsTo
    {
        return $this->belongsTo(User::class, 'derniere_mise_a_jour_par');
    }
}

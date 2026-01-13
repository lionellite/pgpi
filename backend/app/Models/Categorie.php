<?php

namespace App\Models;

use Illuminate.Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Categorie extends Model
{
    use HasFactory;

    protected $fillable = [
        'module_id',
        'user_id',
        'parent1_id',
        'parent2_id',
        'parent3_id',
        'name',
        'type',
        'description',
        'status',
        'fichier_url',
        'mission',
        'vision',
        'fondateurs',
        'ifu',
        'rib',
        'cv',
        'demande',
        'attestion',
        'diplome',
        'date_debut',
        'date_fin',
        'is_active',
    ];

    public function module(): BelongsTo
    {
        return $this->belongsTo(Module::class);
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function parent1(): BelongsTo
    {
        return $this->belongsTo(Categorie::class, 'parent1_id');
    }

    public function parent2(): BelongsTo
    {
        return $this->belongsTo(Categorie::class, 'parent2_id');
    }

    public function parent3(): BelongsTo
    {
        return $this->belongsTo(Categorie::class, 'parent3_id');
    }
}

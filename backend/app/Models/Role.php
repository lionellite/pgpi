<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Role extends Model
{
    protected $fillable = [
        'nom',
        'permissions',
        'taches',
        'module_id',
    ];

    protected function casts(): array
    {
        return [
            'permissions' => 'array',
            'taches' => 'array',
        ];
    }

    // Relations
    public function module(): BelongsTo
    {
        return $this->belongsTo(Module::class);
    }

    public function users(): HasMany
    {
        return $this->hasMany(User::class);
    }
}

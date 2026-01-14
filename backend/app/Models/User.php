<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Laravel\Sanctum\HasApiTokens;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;

class User extends Authenticatable
{
    /** @use HasFactory<\Database\Factories\UserFactory> */
    use HasFactory, Notifiable, HasApiTokens;

    /**
     * The attributes that are mass assignable.
     *
     * @var list<string>
     */
    protected $fillable = [
        'role_id',
        'name',
        'email',
        'password',
        'status',
        'photo_url',
        'sexe',
        'nom',
        'prenoms',
        'date_inscription',
        'last_login_at',
        'module_id',
        'service_id',
    ];

    protected function casts(): array
    {
        return [
            'password' => 'hashed',
            'date_inscription' => 'datetime',
            'last_login_at' => 'datetime',
        ];
    }

    /**
     * The attributes that should be hidden for serialization.
     *
     * @var list<string>
     */
    protected $hidden = [
        'password',
    ];

    // Relations
    public function role(): BelongsTo
    {
        return $this->belongsTo(Role::class);
    }

    public function module(): BelongsTo
    {
        return $this->belongsTo(Module::class);
    }

    public function service(): BelongsTo
    {
        return $this->belongsTo(Service::class);
    }

    public function projetsDiriges()
    {
        return $this->hasMany(Projet::class, 'chef_projet_id');
    }

    public function projets()
    {
        return $this->belongsToMany(Projet::class, 'personnel_projet', 'user_id', 'projet_id')
            ->withPivot('role', 'date_debut', 'date_fin')
            ->withTimestamps();
    }

    public function documents()
    {
        return $this->hasMany(DocumentProjet::class, 'derniere_mise_a_jour_par');
    }

    public function servicesGerants()
    {
        return $this->hasMany(ServiceGerant::class, 'user_id');
    }

    // Helpers pour les rôles - Utilisation du role_id et du nom du rôle
    public function isAdmin(): bool
    {
        return $this->role && strtolower($this->role->nom) === 'admin';
    }

    public function isDirecteur(): bool
    {
        return $this->role && strtolower($this->role->nom) === 'directeur';
    }

    public function isChef(): bool
    {
        return $this->role && (strtolower($this->role->nom) === 'chef' || strtolower($this->role->nom) === 'chef de projet');
    }

    public function isApprenant(): bool
    {
        return $this->role && strtolower($this->role->nom) === 'apprenant';
    }

    public function isPersonnel(): bool
    {
        return $this->role && strtolower($this->role->nom) === 'personnel';
    }
}

<?php

namespace App\Models;

// use Illuminate\Contracts\Auth\MustVerifyEmail;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Laravel\Sanctum\HasApiTokens;

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
        'nom',
        'prenom',
        'email',
        'password',
        'role',
        'departement',
    ];

    /**
     * The attributes that should be hidden for serialization.
     *
     * @var list<string>
     */
    protected $hidden = [
        'password',
        'remember_token',
    ];

    /**
     * Get the attributes that should be cast.
     *
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'email_verified_at' => 'datetime',
            'password' => 'hashed',
        ];
    }

    // Relations
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

    // Helpers pour les rôles
    public function isAdmin(): bool
    {
        return $this->role === 'admin';
    }

    public function isDirecteur(): bool
    {
        return $this->role === 'directeur';
    }

    public function isChefProjet(): bool
    {
        return $this->role === 'chef_projet';
    }
}

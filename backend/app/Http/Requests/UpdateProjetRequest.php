<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class UpdateProjetRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        $user = $this->user();
        $projet = $this->route('projet');
        
        return $user->isAdmin() 
            || $user->isDirecteur() 
            || ($projet && $projet->chef_projet_id === $user->id);
    }

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, \Illuminate\Contracts\Validation\ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        return [
            'titre' => 'sometimes|required|string|max:255',
            'date_debut' => 'sometimes|required|date',
            'date_fin' => 'sometimes|required|date|after:date_debut',
            'objectif_general' => 'sometimes|required|string',
            'objectifs_specifiques' => 'nullable|string',
            'descriptions' => 'nullable|string',
            'etat' => 'sometimes|in:planifie,en_cours,suspendu,cloture,archive',
            'chef_projet_email' => 'nullable|email|exists:users,email',
            'partenaires' => 'nullable|array',
            'partenaires.*.partenaire_id' => 'required|exists:partenaires,id',
            'partenaires.*.role' => 'nullable|string|max:255',
            'personnel' => 'nullable|array',
            'personnel.*.user_id' => 'required|exists:users,id',
            'personnel.*.role' => 'required|string|max:255',
            'personnel.*.date_debut' => 'nullable|date',
            'personnel.*.date_fin' => 'nullable|date|after:personnel.*.date_debut',
            'images' => 'nullable|array',
            'images.*' => 'image|mimes:jpeg,png,jpg,gif|max:2048',
        ];
    }
}

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
            'duree' => 'nullable|integer|min:1',
            'etat' => 'sometimes|in:planifie,en_cours,suspendu,cloture,archive',
            'chef_projet_email' => 'nullable|email|exists:users,email',
            'institution_initiatrice_email' => 'nullable|email|exists:users,email',
            'institutions_emails' => 'nullable|array',
            'institutions_emails.*' => 'email|exists:institutions,email',
            'images' => 'nullable|array',
            'images.*' => 'image|mimes:jpeg,png,jpg,gif|max:2048',
        ];
    }
}

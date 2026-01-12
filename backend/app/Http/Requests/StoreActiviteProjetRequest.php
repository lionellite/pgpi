<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class StoreActiviteProjetRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        $user = $this->user();
        $projet = $this->route('projet');
        
        if (!$projet) {
            return false;
        }
        
        return $user->isAdmin() 
            || $user->isDirecteur() 
            || $projet->chef_projet_id === $user->id
            || $projet->personnel()->where('user_id', $user->id)->exists();
    }

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, \Illuminate\Contracts\Validation\ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        return [
            'titre' => 'required|string|max:255',
            'date_debut' => 'required|date',
            'date_fin' => 'required|date|after:date_debut',
            'activit_mene' => 'nullable|string',
            'data' => 'nullable|json',
            'duree_activite' => 'nullable|integer|min:1',
            'description' => 'nullable|string',
            'type' => 'required|in:atelier,construction,acquisition,formation,recherche,autre',
            'avancement' => 'nullable|integer|min:0|max:100',
            'etat' => 'nullable|in:planifie,en_cours,termine,suspendu',
        ];
    }

    /**
     * Get custom messages for validator errors.
     *
     * @return array<string, string>
     */
    public function messages(): array
    {
        return [
            'titre.required' => 'Le titre de l\'activité est obligatoire.',
            'type.required' => 'Le type d\'activité est obligatoire.',
            'type.in' => 'Le type d\'activité doit être parmi: atelier, construction, acquisition, formation, recherche, autre.',
            'avancement.min' => 'L\'avancement ne peut pas être négatif.',
            'avancement.max' => 'L\'avancement ne peut pas dépasser 100%.',
        ];
    }
}

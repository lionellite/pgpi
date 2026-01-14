<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class StoreProjetRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        $user = $this->user();
        return in_array($user->role, ['admin', 'directeur', 'chef']);
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
            'objectif_general' => 'required|string',
            'objectifs_specifiques' => 'nullable|string',
            'descriptions' => 'nullable|string',
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

    /**
     * Get custom messages for validator errors.
     *
     * @return array<string, string>
     */
    public function messages(): array
    {
        return [
            'titre.required' => 'Le titre du projet est obligatoire.',
            'date_debut.required' => 'La date de début est obligatoire.',
            'date_fin.required' => 'La date de fin est obligatoire.',
            'date_fin.after' => 'La date de fin doit être postérieure à la date de début.',
            'objectif_general.required' => 'L\'objectif général est obligatoire.',
            'images.*.image' => 'Les fichiers doivent être des images.',
            'images.*.max' => 'Chaque image ne doit pas dépasser 2MB.',
        ];
    }
}

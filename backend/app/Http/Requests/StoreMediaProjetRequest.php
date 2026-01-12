<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class StoreMediaProjetRequest extends FormRequest
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
            'fichier' => 'required|file|max:10240', // 10MB max
            'titre' => 'nullable|string|max:255',
            'description' => 'nullable|string',
            'type' => 'required|in:image,video,audio',
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
            'fichier.required' => 'Le fichier est obligatoire.',
            'fichier.max' => 'Le fichier ne doit pas dépasser 10MB.',
            'type.required' => 'Le type de média est obligatoire.',
            'type.in' => 'Le type doit être parmi: image, video, audio, document.',
        ];
    }
}

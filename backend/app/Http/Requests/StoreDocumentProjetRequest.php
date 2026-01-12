<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class StoreDocumentProjetRequest extends FormRequest
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
            'fichier' => 'required|file|mimes:pdf,doc,docx,xls,xlsx,ppt,pptx,txt|max:10240', // 10MB max
            'titre' => 'required|string|max:255',
            'description' => 'nullable|string',
            'type' => 'required|in:rapport,budget,technique,administratif,autre',
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
            'fichier.mimes' => 'Le fichier doit être de type: pdf, doc, docx, xls, xlsx, ppt, pptx, txt.',
            'fichier.max' => 'Le fichier ne doit pas dépasser 10MB.',
            'titre.required' => 'Le titre du document est obligatoire.',
            'type.required' => 'Le type de document est obligatoire.',
            'type.in' => 'Le type doit être parmi: rapport, budget, technique, administratif, autre.',
        ];
    }
}

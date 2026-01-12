<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class MediaProjetResource extends JsonResource
{
    /**
     * Transform the resource into an array.
     *
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'projet_id' => $this->projet_id,
            'titre' => $this->titre,
            'description' => $this->description,
            'type' => $this->type,
            'chemin_fichier' => $this->chemin_fichier,
            'nom_fichier' => $this->nom_fichier,
            'mime_type' => $this->mime_type,
            'taille' => $this->taille,
            'url' => $this->chemin_fichier, // Alias pour faciliter l'utilisation frontend
            'projet' => new ProjetResource($this->whenLoaded('projet')),
            'created_at' => $this->created_at->toDateTimeString(),
            'updated_at' => $this->updated_at->toDateTimeString(),
        ];
    }
}

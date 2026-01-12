<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class DocumentProjetResource extends JsonResource
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
            'etat' => $this->etat,
            'chemin_fichier' => $this->chemin_fichier,
            'nom_fichier' => $this->nom_fichier,
            'mime_type' => $this->mime_type,
            'taille' => $this->taille,
            'version' => $this->version,
            'url' => $this->chemin_fichier, // Alias pour faciliter l'utilisation frontend
            'derniere_mise_a_jour_par' => new UserResource($this->whenLoaded('dernierModificateur')),
            'derniere_mise_a_jour' => $this->derniere_mise_a_jour?->toDateTimeString(),
            'projet' => new ProjetResource($this->whenLoaded('projet')),
            'created_at' => $this->created_at->toDateTimeString(),
            'updated_at' => $this->updated_at->toDateTimeString(),
        ];
    }
}

<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class ActiviteProjetResource extends JsonResource
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
            'date_debut' => $this->date_debut->toDateString(),
            'date_fin' => $this->date_fin->toDateString(),
            'activit_mene' => $this->activit_mene,
            'data' => $this->data,
            'duree_activite' => $this->duree_activite,
            'description' => $this->description,
            'etat' => $this->etat,
            'type' => $this->type,
            'avancement' => $this->avancement,
            'projet' => new ProjetResource($this->whenLoaded('projet')),
            'created_at' => $this->created_at->toDateTimeString(),
            'updated_at' => $this->updated_at->toDateTimeString(),
        ];
    }
}

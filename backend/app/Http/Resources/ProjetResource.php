<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class ProjetResource extends JsonResource
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
            'titre' => $this->titre,
            'date_debut' => $this->date_debut->toDateString(),
            'date_fin' => $this->date_fin->toDateString(),
            'objectif_general' => $this->objectif_general,
            'objectifs_specifiques' => $this->objectifs_specifiques,
            'descriptions' => $this->descriptions,
            'images' => $this->images,
            'duree' => $this->duree,
            'etat' => $this->etat,
            'avancement' => $this->avancement,
            'chef_projet' => new UserResource($this->whenLoaded('chefProjet')),
            'chef_projet_id' => $this->chef_projet_id,
            'activites' => ActiviteProjetResource::collection($this->whenLoaded('activites')),
            'medias' => MediaProjetResource::collection($this->whenLoaded('medias')),
            'documents' => DocumentProjetResource::collection($this->whenLoaded('documents')),
            'personnel' => UserResource::collection($this->whenLoaded('personnel')),
            'partenaires' => PartenaireResource::collection($this->whenLoaded('partenaires')),
            'created_at' => $this->created_at->toDateTimeString(),
            'updated_at' => $this->updated_at->toDateTimeString(),
        ];
    }
}

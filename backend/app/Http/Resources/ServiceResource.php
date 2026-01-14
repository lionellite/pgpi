<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class ServiceResource extends JsonResource
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
            'id_parent' => $this->id_parent,
            'titre' => $this->titre,
            'code' => $this->code,
            'type' => $this->type,
            'statut' => $this->statut,
            'date_creation' => $this->date_creation?->toDateString(),
            'parent' => $this->whenLoaded('parent', function () {
                return [
                    'id' => $this->parent->id,
                    'titre' => $this->parent->titre,
                    'code' => $this->parent->code,
                ];
            }),
        ];
    }
}

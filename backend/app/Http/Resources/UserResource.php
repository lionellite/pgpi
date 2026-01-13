<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class UserResource extends JsonResource
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
            'name' => $this->name,
            'email' => $this->email,
            'role' => $this->whenLoaded('role'),
            'status' => $this->status,
            'photo_url' => $this->photo_url,
            'sexe' => $this->sexe,
            'nom' => $this->nom,
            'prenoms' => $this->prenoms,
            'date_inscription' => $this->date_inscription,
            'last_login_at' => $this->last_login_at,
            'module' => $this->whenLoaded('module'),
            'created_at' => $this->created_at->toDateTimeString(),
            'updated_at' => $this->updated_at->toDateTimeString(),
        ];
    }
}

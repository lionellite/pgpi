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
            'role_id' => $this->role_id,
            'role' => $this->whenLoaded('role', function () {
                return [
                    'id' => $this->role->id,
                    'nom' => $this->role->nom,
                    'permissions' => $this->role->permissions,
                    'taches' => $this->role->taches,
                ];
            }),
            'name' => $this->name,
            'email' => $this->email,
            'status' => $this->status,
            'photo_url' => $this->photo_url,
            'sexe' => $this->sexe,
            'nom' => $this->nom,
            'prenoms' => $this->prenoms,
            'date_inscription' => $this->date_inscription?->toDateTimeString(),
            'last_login_at' => $this->last_login_at?->toDateTimeString(),
            'module_id' => $this->module_id,
            'module' => $this->whenLoaded('module', function () {
                return [
                    'id' => $this->module->id,
                    'code' => $this->module->code,
                    'nom' => $this->module->nom,
                ];
            }),
            'created_at' => $this->created_at->toDateTimeString(),
            'updated_at' => $this->updated_at->toDateTimeString(),
        ];
    }
}

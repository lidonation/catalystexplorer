<?php declare(strict_types=1);

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class IdeascaleProfileResource extends JsonResource
{
    /**
     * Transform the resource into an array.
     *
     * @param  Request  $request
     */
    public function toArray($request): array
    {
        return [
            'id' => $this->id,
            'ideascale_id' => $this->ideascale_id,
            'username' => $this->username,
            'email' => $this->email,
            'name' => $this->name,
            'bio' => $this->bio,
            'created_at' => $this->created_at,
            'updated_at' => $this->updated_at,
            'twitter' => $this->twitter,
            'linkedin' => $this->linkedin,
            'discord' => $this->discord,
            'ideascale' => $this->ideascale,
            'claimed_by' => $this->claimed_by,
            'telegram' => $this->telegram,
            'title' => $this->title,
        ];
    }
}
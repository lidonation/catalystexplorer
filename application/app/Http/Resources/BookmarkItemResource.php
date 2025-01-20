<?php

declare(strict_types=1);

namespace App\Http\Resources;

use Illuminate\Contracts\Support\Arrayable;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;
use Illuminate\Support\Str;

class BookmarkItemResource extends JsonResource
{
    /**
     * Transform the resource into an array.
     *
     * @param  Request  $request
     */
    public function toArray($request): array|\JsonSerializable|Arrayable
    {
        $modelResource = 'App\\Http\\Resources\\'.Str::studly(Str::singular(class_basename($this->model))).'Resource';

        return [
            'id' => $this->id,
            'bookmark_collection_id' => $this->bookmark_collection_id,
            'parent_id' => $this->parent_id,
            'title' => $this->title,
            'content' => $this->content,
            'link' => $this->link,
            'created_at' => $this->created_at,
            'model' => class_exists($modelResource) ? (new $modelResource($this->model))->toArray($request) : $this->model,
        ];
    }
}

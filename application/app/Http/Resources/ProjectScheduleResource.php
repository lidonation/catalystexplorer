<?php

declare(strict_types=1);

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class ProjectScheduleResource extends JsonResource
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
            'title' => $this->title,
            'status' => $this->status,
            'started_at' => $this->started_at,
            'completion_rate' => $this->completion_rate,
            'funds_distributed' => $this->funds_distributed,
            'milestone_count' => $this->milestone_count,
            'on_track' => $this->on_track,
            'created_at' => $this->created_at,

            // Relationships
            'proposal' => $this->when($this->relationLoaded('proposal'), function () {
                return [
                    'id' => $this->proposal->id,
                    'title' => $this->proposal->title,
                    'slug' => $this->proposal->slug,
                ];
            }),
            'fund' => $this->when($this->relationLoaded('fund'), function () {
                return [
                    'id' => $this->fund->id,
                    'title' => $this->fund->title,
                ];
            }),
            'milestones' => MilestoneResource::collection($this->whenLoaded('milestones')),
        ];
    }
}

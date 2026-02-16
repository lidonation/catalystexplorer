<?php

declare(strict_types=1);

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class MilestoneResource extends JsonResource
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
            'milestone' => $this->milestone,
            'description' => $this->description,
            'status' => $this->status,
            'current' => $this->current,
            'outputs' => $this->outputs,
            'acceptance_criteria1' => $this->acceptance_criteria,
            'acceptance_criteria' => $this->success_criteria,
            'evidence' => $this->evidence,
            'month' => $this->month,
            'cost' => $this->cost,
            'completion_date' => $this->completion_date,
            'completion_percent' => $this->completion_percent,

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
            'som_reviews' => $this->whenLoaded('som_reviews'),
            'poas' => $this->whenLoaded('poas'),
        ];
    }
}

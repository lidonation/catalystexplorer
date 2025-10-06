<?php

declare(strict_types=1);

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class CatalystTallyResource extends JsonResource
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
            'hash' => $this->hash,
            'tally' => $this->tally,
            'model_id' => $this->model_id,

            'category_rank' => $this->category_rank,
            'fund_rank' => $this->fund_rank,
            'overall_rank' => $this->overall_rank,

            'chance_approval' => $this->chance_approval,
            'chance_funding' => $this->chance_funding,

            'fund' => $this->when(
                $request->get('include_fund'),
                new FundResource($this->whenLoaded('fund'))
            ),
            'proposal' => $this->when(
                $request->get('include_proposal'),
                new ProposalResource($this->whenLoaded('proposal'))
            ),

            'team' => $this->when(
                $request->get('include_proposal') || $request->get('include_proposal_profiles'),
                ProposalProfileResource::collection($this->whenLoaded('proposal.proposal_profiles'))
            ),

            'updated_at' => $this->updated_at,
        ];
    }
}

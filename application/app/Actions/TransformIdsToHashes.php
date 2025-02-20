<?php

declare(strict_types=1);

namespace App\Actions;

use App\DataTransferObjects\CampaignData;
use App\DataTransferObjects\FundData;
use App\Models\Model;
use App\Services\HashIdService;
use Illuminate\Support\Collection;

class TransformIdsToHashes
{
    public function __invoke(Collection &$collection, Model $model): Collection
    {
        return $this->handle($collection, $model);
    }

    public function handle(Collection &$collection, Model $model): Collection
    {
        return $collection
            ->map(function ($array) use ($model) {
                $array['hash'] = app(HashIdService::class, compact('model'))
                    ->encode($array['id']);
                if (isset($array['campaign'])) {
                    $array['campaign'] = new CampaignData(
                        hash: $array['campaign']['id'] ? app(HashIdService::class, ['model' => $model])->encode($array['campaign']['id']) : null,
                        fund_id: $array['campaign']['fund']['id'] ?? null,
                        title: $array['campaign']['title'] ?? null,
                        meta_title: null,
                        slug: null,
                        excerpt: null,
                        comment_prompt: null,
                        content: null,
                        amount: (float) ($array['campaign']['amount'] ?? 0),
                        created_at: null,
                        updated_at: null,
                        label: $array['campaign']['label'] ?? null,
                        currency: $array['campaign']['currency'] ?? 'ADA',
                        proposals_count: (int) ($array['campaign']['proposals_count'] ?? 0),
                        unfunded_proposals_count: null,
                        funded_proposals_count: null,
                        completed_proposals_count: null,
                        total_requested: null,
                        total_awarded: null,
                        total_distributed: null
                    );
                }

                // Transform fund data if it exists
                if (isset($array['fund'])) {
                    $array['fund'] = new FundData(
                        amount: (float) ($array['fund']['amount'] ?? 0),
                        label: $array['fund']['label'] ?? '',
                        title: $array['fund']['title'] ?? '',
                        hash: $array['fund']['id'] ? app(HashIdService::class, ['model' => $model])->encode($array['fund']['id']) : null,
                        proposals_count: null,
                        funded_proposals_count: null,
                        completed_proposals_count: null,
                        amount_requested: null,
                        amount_awarded: null,
                        meta_title: null,
                        slug: null,
                        user_id: null,
                        excerpt: null,
                        comment_prompt: null,
                        content: null,
                        hero_img_url: null,
                        status: $array['fund']['status'] ?? null,
                        launched_at: $array['fund']['launched_at'] ?? null,
                        awarded_at: null,
                        color: null,
                        currency: $array['fund']['currency'] ?? 'ADA',
                        review_started_at: null,
                        parent_id: null
                    );
                }

                return $array;
            });
    }
}

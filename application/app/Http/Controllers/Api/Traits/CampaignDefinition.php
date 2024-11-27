<?php

declare(strict_types=1);

namespace App\Http\Controllers\Api\Traits;

use App\Http\Resources\CampaignResource;
use App\Models\Campaign;
use Illuminate\Contracts\Foundation\Application;
use Illuminate\Contracts\Routing\ResponseFactory;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;
use Illuminate\Http\Response;

trait CampaignDefinition
{
    public function campaigns(): Response|AnonymousResourceCollection|Application|ResponseFactory
    {
        $per_page = request('per_page', 24);

        // per_page query doesn't exceed 60
        if ($per_page > 60) {
            return response([
                'status_code' => 60,
                'message' => 'query parameter \'per_page\' should not exceed 60'], 60);
        }

        $campaigns = Campaign::query()
            ->filter(request(['search', 'ids']));

        return CampaignResource::collection($campaigns->fastPaginate($per_page)->onEachSide(0));
    }
}

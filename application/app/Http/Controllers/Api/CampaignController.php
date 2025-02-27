<?php

declare(strict_types=1);

namespace App\Interfaces\Http\Controllers\Api;

use App\Interfaces\Http\Controllers\Controller;
use App\Interfaces\Http\Resources\CampaignResource;
use App\Models\Campaign;
use Illuminate\Contracts\Foundation\Application;
use Illuminate\Contracts\Routing\ResponseFactory;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;
use Illuminate\Http\Response;

class CampaignController extends Controller
{
    public function campaign($campaignId): \Illuminate\Http\Response|CampaignResource|Application|ResponseFactory
    {
        $campaign = Campaign::find($campaignId);

        if (is_null($campaign)) {
            return response([
                'errors' => 'Campaign not found',
            ], Response::HTTP_NOT_FOUND);
        } else {
            return new CampaignResource($campaign);
        }
    }

    public function campaigns(): Response|AnonymousResourceCollection|Application|ResponseFactory
    {
        $per_page = request('per_page', 24);

        // per_page query doesn't exceed 60
        if ($per_page > 60) {
            return response([
                'status_code' => 60,
                'message' => 'query parameter \'per_page\' should not exceed 60',
            ], 60);
        }

        $campaigns = Campaign::query()
            ->filter(request(['search', 'ids']));

        return CampaignResource::collection($campaigns->fastPaginate($per_page)->onEachSide(0));
    }
}

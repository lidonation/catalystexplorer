<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Campaign;
use App\Http\Resources\CampaignResource;
use Illuminate\Http\Request;
use Illuminate\Http\Response;

class CampaignController extends Controller
{
    use Traits\CampaignDefinition;

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
}

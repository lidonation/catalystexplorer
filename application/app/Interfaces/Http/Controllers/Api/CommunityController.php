<?php

declare(strict_types=1);

namespace App\Interfaces\Http\Controllers\Api;

use App\Interfaces\Http\Controllers\Controller;
use App\Interfaces\Http\Resources\CommunityResource;
use App\Models\Community;
use Illuminate\Contracts\Foundation\Application;
use Illuminate\Contracts\Routing\ResponseFactory;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;
use Illuminate\Http\Response;

class CommunityController extends Controller
{
    public function community($communityId): \Illuminate\Http\Response|CommunityResource|Application|ResponseFactory
    {
        $community = Community::find($communityId);

        if (is_null($community)) {
            return response([
                'errors' => 'Communities not found',
            ], Response::HTTP_NOT_FOUND);
        } else {
            return new CommunityResource($community);
        }
    }

    public function communities(): Response|AnonymousResourceCollection|Application|ResponseFactory
    {
        $per_page = request('per_page', 24);

        // per_page query doesn't exceed 60
        if ($per_page > 60) {
            return response([
                'status_code' => 60,
                'message' => 'query parameter \'per_page\' should not exceed 60',
            ], 60);
        }

        $communities = Community::query()
            ->filter(request(['search', 'ids']));

        return CommunityResource::collection($communities->fastPaginate($per_page)->onEachSide(0));
    }
}

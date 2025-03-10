<?php

declare(strict_types=1);

namespace App\Http\Controllers\Api;

use App\DataTransferObjects\CommunityData;
use App\Http\Controllers\Controller;
use App\Http\Resources\CommunityResource;
use App\Models\Community;
use Illuminate\Contracts\Foundation\Application;
use Illuminate\Contracts\Routing\ResponseFactory;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;
use Illuminate\Http\Response;
use Inertia\Inertia;

class CommunityController extends Controller
{
    public function index(): \Inertia\Response
    {
        $per_page = request('per_page', 24);

        $communities = Community::query()
            ->filter(request(['search', 'ids']));

        $props = [
            'communities' => to_length_aware_paginator(
                CommunityData::collect($communities->paginate($per_page))
            ),
        ];

        return Inertia::render('Communities/Index', $props);
    }

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

    public function connections(Request $request, int $id): array
    {
        $community = Community::findOrFail($id);

        $connections = $community->getConnectionsData($request);

        return $connections;
    }
}

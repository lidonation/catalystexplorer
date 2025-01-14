<?php

declare(strict_types=1);

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Resources\GroupResource;
use App\Models\Group;
use Illuminate\Contracts\Foundation\Application;
use Illuminate\Contracts\Routing\ResponseFactory;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;
use Illuminate\Http\Response;

class GroupController extends Controller
{
    public function group($groupId): \Illuminate\Http\Response|GroupResource|Application|ResponseFactory
    {
        $group = Group::find($groupId);

        if (is_null($group)) {
            return response([
                'errors' => 'Group not found',
            ], Response::HTTP_NOT_FOUND);
        } else {
            return new GroupResource($group);
        }
    }

    public function groups(): Response|AnonymousResourceCollection|Application|ResponseFactory
    {
        $per_page = request('per_page', 24);

        // per_page query doesn't exceed 60
        if ($per_page > 60) {
            return response([
                'status_code' => 60,
                'message' => 'query parameter \'per_page\' should not exceed 60',
            ], 60);
        }

        $groups = Group::query()
            ->filter(request(['search', 'ids']));

        return GroupResource::collection($groups->fastPaginate($per_page)->onEachSide(0));
    }
}

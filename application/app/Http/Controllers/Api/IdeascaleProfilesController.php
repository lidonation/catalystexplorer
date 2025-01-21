<?php

declare(strict_types=1);

namespace App\Http\Controllers\Api;

use Illuminate\Http\Response;
use App\Models\IdeascaleProfile;
use Illuminate\Http\JsonResponse;
use App\Http\Controllers\Controller;
use App\Http\Resources\IdeascaleProfileResource;
use Illuminate\Contracts\Foundation\Application;
use Illuminate\Contracts\Routing\ResponseFactory;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;

class IdeascaleProfilesController extends Controller
{
    public function ideascale_profile($ideascaleId): Response|IdeascaleProfileResource|Application|ResponseFactory
    {
        $ideascale = IdeascaleProfile::find($ideascaleId);

        if (is_null($ideascale)) {
            return response([
                'errors' => 'Ideascale Profiles not found',
            ], Response::HTTP_NOT_FOUND);
        } else {
            return new IdeascaleProfileResource($ideascale);
        }
    }

    public function ideascaleProfiles(): Response|AnonymousResourceCollection|Application|ResponseFactory
    {
        $per_page = request('per_page', 24);

        // per_page query doesn't exceed 60
        if ($per_page > 60) {
            return response([
                'status_code' => 60,
                'message' => 'query parameter \'per_page\' should not exceed 60',
            ], 60);
        }

        $ideascales = IdeascaleProfile::query()
            ->filter(request(['search', 'ids']));

        return IdeascaleProfileResource::collection($ideascales->fastPaginate($per_page)->onEachSide(0));
    }

    public function connectionsData(IdeascaleProfile $profile): JsonResponse
    {
        $nodes = $profile->connectedGroupsAndUsers()->map(function ($item) {
            return [
                'id' => $item->id,
                'name' => $item->name ?? 'Unnamed',
                'color' => $item instanceof IdeascaleProfile ? 'rgb(97, 205, 187)' : 'rgb(232, 193, 160)',
                'profilePhotoUrl' => $item->profilePhotoUrl,
                'size' => 24,
                'height' => 1,
            ];
        });

        $links = $profile->connections()->get()->map(function ($connection) {
            return [
                'source' => $connection->previous_model_id,
                'target' => $connection->next_model_id,
                'distance' => 100,
            ];
        });

        return response()->json([
            'nodes' => $nodes->toArray(),
            'links' => $links->toArray(),
        ]);
    }

}

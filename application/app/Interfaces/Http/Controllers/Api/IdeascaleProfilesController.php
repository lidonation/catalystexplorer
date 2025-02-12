<?php

declare(strict_types=1);

namespace App\Interfaces\Http\Controllers\Api;

use App\Interfaces\Http\Controllers\Controller;
use App\Interfaces\Http\Resources\IdeascaleProfileResource;
use App\Models\IdeascaleProfile;
use Illuminate\Contracts\Foundation\Application;
use Illuminate\Contracts\Routing\ResponseFactory;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;
use Symfony\Component\HttpFoundation\Response;

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

        $ideascaleProfiles = IdeascaleProfile::query()
            ->filter(request(['search', 'ids']));

        return IdeascaleProfileResource::collection($ideascaleProfiles->fastPaginate($per_page)->onEachSide(0));
    }

    public function connections(IdeascaleProfile $profile): JsonResponse
    {
        if (! $profile) {
            return response()->json([
                'errors' => 'Profile not found',
            ], Response::HTTP_NOT_FOUND);
        }

        $nodes = $profile->connectedGroupsAndUsers()
            ->map(fn ($item) => [
                'id' => $item->id,
                'name' => $item->name ?? 'Unnamed',
                'color' => $item instanceof IdeascaleProfile ? 'rgb(97, 205, 187)' : 'rgb(232, 193, 160)',
                'profilePhotoUrl' => $item->profilePhotoUrl,
                'size' => 24,
                'height' => 1,
            ]);

        $links = $profile->connections()->get()->map(fn ($connection) => [
            'source' => $connection->previous_model_id,
            'target' => $connection->next_model_id,
            'distance' => 100,
        ]);

        if ($links->isEmpty()) {
            return response()->json([
                'message' => 'No connections found.',
                'nodes' => $nodes->toArray(),
                'links' => [],
            ]);
        }

        return response()->json([
            'nodes' => $nodes->toArray(),
            'links' => $links->toArray(),
        ]);
    }
}

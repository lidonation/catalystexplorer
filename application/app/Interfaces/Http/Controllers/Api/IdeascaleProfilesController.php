<?php

declare(strict_types=1);

namespace App\Interfaces\Http\Controllers\Api;

use App\Interfaces\Http\Controllers\Controller;
use App\Interfaces\Http\Resources\IdeascaleProfileResource;
use App\Models\IdeascaleProfile;
use Illuminate\Contracts\Foundation\Application;
use Illuminate\Contracts\Routing\ResponseFactory;
use Illuminate\Http\Request;
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

    public function connections(Request $request, int $id): array
    {
        $ideascaleProfile = IdeascaleProfile::findOrFail($id);

        $connections = $ideascaleProfile->getConnectionsData($request);

        return $connections;
    }
}

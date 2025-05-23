<?php

declare(strict_types=1);

namespace App\Http\Controllers\Api;

use App\DataTransferObjects\IdeascaleProfileData;
use App\Http\Controllers\Controller;
use App\Http\Resources\IdeascaleProfileResource;
use App\Models\IdeascaleProfile;
use App\Repositories\IdeascaleProfileRepository;
use Illuminate\Contracts\Foundation\Application;
use Illuminate\Contracts\Routing\ResponseFactory;
use Illuminate\Http\Request;
use Illuminate\Pagination\LengthAwarePaginator;
use Laravel\Nova\Support\Fluent;
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

    public function ideascaleProfiles(): array|Response
    {
        $per_page = request('per_page', 24);

        // per_page query doesn't exceed 60
        if ($per_page > 60) {
            return response([
                'status_code' => 60,
                'message' => 'query parameter \'per_page\' should not exceed 60',
            ], 60);
        }

        $requestValues = request(['ids', 'hashes']);

        $ids = null;
        $hashes = null;

        if (! empty($requestValues['hashes'])) {
            $hashes = implode(',', $requestValues['hashes'] ?? []);
            $args['filter'] = "hash IN [{$hashes}]";
        }

        if (! empty($requestValues['ids'])) {
            $ids = implode(',', $requestValues['ids'] ?? []);
            $args['filter'] = "id IN [{$ids}]";
        }

        $page = request('page') ?? 1;
        $args['offset'] = ($page - 1) * $per_page;
        $args['limit'] = $per_page;

        $profles = app(IdeascaleProfileRepository::class);

        $builder = $profles->search(
            request('search') ?? '',
            $args
        );

        $response = new Fluent($builder->raw());

        $pagination = new LengthAwarePaginator(
            IdeascaleProfileData::collect($response->hits),
            $response->estimatedTotalHits,
            $per_page,
            $page,
            [
                'pageName' => 'p',
            ]
        );

        return $pagination->onEachSide(1)->toArray();
    }

    public function connections(Request $request, int $id): array
    {
        $ideascaleProfile = IdeascaleProfile::findOrFail($id);

        $connections = $ideascaleProfile->getConnectionsData($request);

        return $connections;
    }
}

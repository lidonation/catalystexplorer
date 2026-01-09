<?php

declare(strict_types=1);

namespace App\Http\Controllers\Api;

use App\DataTransferObjects\CatalystProfileData;
use App\Http\Controllers\Controller;
use App\Models\CatalystProfile;
use App\Repositories\CatalystProfileRepository;
use Illuminate\Contracts\Foundation\Application;
use Illuminate\Contracts\Routing\ResponseFactory;
use Illuminate\Http\Request;
use Illuminate\Pagination\LengthAwarePaginator;
use Laravel\Nova\Support\Fluent;
use Symfony\Component\HttpFoundation\Response;

class CatalystProfilesController extends Controller
{
    public function catalyst_profile($catalystId): Response|Application|ResponseFactory
    {
        $catalyst = CatalystProfile::find($catalystId);

        if (is_null($catalyst)) {
            return response([
                'errors' => 'Catalyst Profile not found',
            ], Response::HTTP_NOT_FOUND);
        }

        return response(CatalystProfileData::from($catalyst));
    }

    public function catalystProfiles(): array|Response
    {
        $per_page = request('per_page', 24);

        // per_page query doesn't exceed 60
        if ($per_page > 60) {
            return response([
                'status_code' => 60,
                'message' => 'query parameter \'per_page\' should not exceed 60',
            ], 60);
        }

        $requestValues = request(['ids']);

        if (! empty($requestValues['ids'])) {
            $ids = implode(',', $requestValues['ids'] ?? []);
            $args['filter'] = "id IN [{$ids}]";
        }

        $page = request('page') ?? 1;
        $args['offset'] = ($page - 1) * $per_page;
        $args['limit'] = $per_page;

        $profiles = app(CatalystProfileRepository::class);

        $builder = $profiles->search(
            request('search') ?? '',
            $args
        );

        $response = new Fluent($builder->raw());

        $pagination = new LengthAwarePaginator(
            CatalystProfileData::collect($response->hits),
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
        $catalystProfile = CatalystProfile::findOrFail($id);

        $connections = $catalystProfile->getConnectionsData($request);

        return $connections;
    }

    public function incrementalConnections(Request $request): array|Response
    {
        $id = $request->get('id');
        $catalystProfile = CatalystProfile::find($id);

        $connections = $catalystProfile->getIncrementalConnectionsData($request);

        return $connections;
    }
}

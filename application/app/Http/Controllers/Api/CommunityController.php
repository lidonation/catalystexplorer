<?php

declare(strict_types=1);

namespace App\Http\Controllers\Api;

use App\DataTransferObjects\CommunityData;
use App\Http\Controllers\Controller;
use App\Http\Resources\CommunityResource;
use App\Models\Community;
use App\Repositories\CommunityRepository;
use Illuminate\Http\Response;
use Illuminate\Pagination\LengthAwarePaginator;
use Illuminate\Support\Fluent;

class CommunityController extends Controller
{
    public function community($communityId): CommunityResource|Response
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

    public function communities(): array|Response
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

        $communities = app(CommunityRepository::class);

        $builder = $communities->search(
            request('search') ?? '',
            $args
        );

        $response = new Fluent($builder->raw());

        $pagination = new LengthAwarePaginator(
            CommunityData::collect($response->hits),
            $response->estimatedTotalHits,
            $per_page,
            $page,
            [
                'pageName' => 'p',
            ]
        );

        return $pagination->onEachSide(1)->toArray();
    }
}

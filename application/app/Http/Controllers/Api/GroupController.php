<?php

declare(strict_types=1);

namespace App\Http\Controllers\Api;

use App\DataTransferObjects\GroupData;
use App\Http\Controllers\Controller;
use App\Http\Resources\GroupResource;
use App\Models\Group;
use App\Repositories\GroupRepository;
use Illuminate\Contracts\Foundation\Application;
use Illuminate\Contracts\Routing\ResponseFactory;
use Illuminate\Http\Request;
use Illuminate\Http\Response;
use Illuminate\Pagination\LengthAwarePaginator;
use Illuminate\Support\Fluent;

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

    public function groups(): array|Response
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

        $groups = app(GroupRepository::class);

        $builder = $groups->search(
            request('search') ?? '',
            $args
        );

        $response = new Fluent($builder->raw());

        $pagination = new LengthAwarePaginator(
            GroupData::collect($response->hits),
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
        $group = Group::findOrFail($id);

        $connections = $group->getConnectionsData($request);

        return $connections;
    }

    public function incrementalConnections(Request $request): array
    {
        $hash = $request->get('hash');
        $group = Group::byHash($hash);

        $connections = $group->getIncrementalConnectionsData($request);

        return $connections;
    }
}

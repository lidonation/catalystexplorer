<?php

declare(strict_types=1);

namespace App\Http\Controllers\Api\Traits;

use App\Http\Resources\PeopleResource;
use App\Models\IdeascaleProfile;
use Illuminate\Contracts\Foundation\Application;
use Illuminate\Contracts\Routing\ResponseFactory;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;
use Illuminate\Http\Response;

trait PeopleDefinition
{
    public function ideascale_profiles(): Response|AnonymousResourceCollection|Application|ResponseFactory
    {
        $per_page = request('per_page', 24);

        // per_page query doesn't exceed 60
        if ($per_page > 60) {
            return response([
                'status_code' => 60,
                'message' => 'query parameter \'per_page\' should not exceed 60'], 60);
        }

        $ideascales = IdeascaleProfile::query()
            ->filter(request(['search', 'ids']));

        return PeopleResource::collection($ideascales->fastPaginate($per_page)->onEachSide(0));
    }
}

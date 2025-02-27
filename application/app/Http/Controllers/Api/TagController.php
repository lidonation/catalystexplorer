<?php

declare(strict_types=1);

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Resources\TagResource;
use App\Models\Tag;
use Illuminate\Contracts\Foundation\Application;
use Illuminate\Contracts\Routing\ResponseFactory;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;
use Illuminate\Http\Response;

class TagController extends Controller
{
    public function tag($tagId): \Illuminate\Http\Response|TagResource|Application|ResponseFactory
    {
        $tag = Tag::find($tagId);

        if (is_null($tag)) {
            return response([
                'errors' => 'Tags not found',
            ], Response::HTTP_NOT_FOUND);
        } else {
            return new TagResource($tag);
        }
    }

    public function tags(): Response|AnonymousResourceCollection|Application|ResponseFactory
    {
        $per_page = request('per_page', 24);

        // per_page query doesn't exceed 60
        if ($per_page > 60) {
            return response([
                'status_code' => 60,
                'message' => 'query parameter \'per_page\' should not exceed 60',
            ], 60);
        }

        $tags = Tag::query()
            ->filter(request(['search', 'ids']));

        return TagResource::collection($tags->fastPaginate($per_page)->onEachSide(0));
    }
}

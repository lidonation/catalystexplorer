<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Tag;
use App\Http\Resources\TagResource;
use Illuminate\Http\Request;
use Illuminate\Http\Response;

class TagController extends Controller
{
    use Traits\TagDefinition;

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
}

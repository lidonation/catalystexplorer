<?php declare(strict_types=1);

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Community;
use App\Http\Resources\CommunityResource;
use Illuminate\Http\Request;
use Illuminate\Http\Response;

class CommunityController extends Controller
{
    use Traits\CommunityDefinition;

    public function community($communityId): \Illuminate\Http\Response|CommunityResource|Application|ResponseFactory
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
}

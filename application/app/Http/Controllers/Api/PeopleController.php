<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\IdeascaleProfile;
use App\Http\Resources\PeopleResource;
use Illuminate\Http\Request;
use Illuminate\Http\Response;

class PeopleController extends Controller
{
    use Traits\PeopleDefinition;

    public function ideascale_profile($ideascaleId): \Illuminate\Http\Response|PeopleResource|Application|ResponseFactory
    {
        $ideascale = IdeascaleProfile::find($ideascaleId);

        if (is_null($ideascale)) {
            return response([
                'errors' => 'Ideascale Profiles not found',
            ], Response::HTTP_NOT_FOUND);
        } else {
            return new PeopleResource($ideascale);
        }
    }
}

<?php

declare(strict_types=1);

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Resources\IdeascaleProfileResource;
use App\Models\IdeascaleProfile;
use Illuminate\Contracts\Foundation\Application;
use Illuminate\Contracts\Routing\ResponseFactory;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;
use Illuminate\Support\Str;
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
            ->withCount(['proposals'])
            ->filter(request(['search', 'ids']));

        return IdeascaleProfileResource::collection($ideascaleProfiles->fastPaginate($per_page)->onEachSide(0));
    }

    public function connections(Request $request, int $id): array
    {
        $ideascaleProfile = IdeascaleProfile::findOrFail($id);

        $connections = $ideascaleProfile->getConnectionsData($request);

        return $connections;
    }

    public function claimIdeascaleProfile(Request $request, IdeascaleProfile $ideascaleProfile)
    {

        $request->validate([
            'name' => 'required|string',
            'email' => 'required|email',
            'bio' => 'nullable|string',
            'ideascaleProfile' => 'nullable|string',
            'twitter' => 'nullable|string',
            'discord' => 'nullable|string',
            'linkedIn' => 'nullable|string',
        ]);

        $randomCode = Str::random(5);

        $ideascaleProfile->saveMeta('name', $request->input('name') ?? '');
        $ideascaleProfile->saveMeta('email', $request->input('email') ?? '');
        $ideascaleProfile->saveMeta('bio', $request->input('bio') ?? '');
        $ideascaleProfile->saveMeta('ideascaleProfileLink', $request->input('ideascaleProfileLink') ?? '');
        $ideascaleProfile->saveMeta('discord', $request->input('discord') ?? '');
        $ideascaleProfile->saveMeta('twitter', $request->input('twitter') ?? '');
        $ideascaleProfile->saveMeta('linkedIn', $request->input('linkedIn') ?? '');
        $ideascaleProfile->saveMeta('verificationCode', $randomCode);
        $ideascaleProfile->save();

        return response()->json([
            'message' => 'Profile claimed successfully',
            'verificationCode' => $randomCode,
        ]);
    }
}

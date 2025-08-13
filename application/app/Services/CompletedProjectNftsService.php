<?php

declare(strict_types=1);

namespace App\Services;

use App\DataTransferObjects\IdeascaleProfileData;
use App\Models\IdeascaleProfile;
use Illuminate\Pagination\LengthAwarePaginator;
use Illuminate\Support\Facades\Auth;

class CompletedProjectNftsService
{
    public function getClaimedIdeascaleProfiles(): array
    {
        $page = 1;

        $limit = 3;

        $user = Auth::user();

        $claimedIdeascaleProfiles = [];

        if ($user) {
            $claimedIdeascaleProfiles = IdeascaleProfile::where('claimed_by_uuid', $user->id)
                ->withCount(['proposals'])
                ->get()
                ->toArray();
        }

        $pagination = new LengthAwarePaginator(
            IdeascaleProfileData::collect($claimedIdeascaleProfiles),
            $limit,
            $page,
            options: [
                'pageName' => 'p',
            ]
        );

        return $pagination->onEachSide(1)->toArray();
    }
}

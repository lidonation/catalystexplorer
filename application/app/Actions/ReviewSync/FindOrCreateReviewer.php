<?php

declare(strict_types=1);

namespace App\Actions\ReviewSync;

use App\Models\Reviewer;

class FindOrCreateReviewer
{
    public function __invoke(string $assessorId): Reviewer
    {
        $assessorId = trim($assessorId);
        $reviewer = Reviewer::where('catalyst_reviewer_id', $assessorId)->first();

        if (! $reviewer) {
            $reviewer = Reviewer::create([
                'catalyst_reviewer_id' => $assessorId,
            ]);
        }

        return $reviewer;
    }
}

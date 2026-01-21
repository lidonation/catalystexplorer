<?php

declare(strict_types=1);

namespace App\Actions\ReviewSync;

use App\Models\Discussion;
use App\Models\Proposal;

class EnsureDiscussionsExist
{
    public function __invoke(Proposal $proposal): array
    {
        $discussions = [];

        foreach (ReviewSyncConstants::DISCUSSION_TEMPLATES as $key => $template) {
            $discussion = Discussion::where('model_type', Proposal::class)
                ->where('model_id', $proposal->id)
                ->where('title', $template['title'])
                ->first();

            if (! $discussion) {
                $discussion = new Discussion;
                $discussion->model_type = Proposal::class;
                $discussion->model_id = $proposal->id;
                $discussion->title = $template['title'];
                $discussion->comment_prompt = $template['comment_prompt'];
                $discussion->status = 'published';
                $discussion->save();
            }

            $discussions[$template['title']] = $discussion;
        }

        return $discussions;
    }
}

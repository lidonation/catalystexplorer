<?php

declare(strict_types=1);

namespace App\Actions\ReviewSync;

class ReviewSyncConstants
{
    /**
     * Discussion templates for proposal reviews
     */
    public const DISCUSSION_TEMPLATES = [
        'Impact' => [
            'title' => 'Impact',
            'comment_prompt' => 'Has this project clearly demonstrated in all aspects of the proposal that it will positively impact the cardano ecosystem?',
        ],
        'Feasibility' => [
            'title' => 'Feasibility',
            'comment_prompt' => 'Is this project feasible based on the proposal submitted? Does the plan and associated budget and milestones look achievable? Does the team have the skills, experience, capability and capacity to complete the project successfully?',
        ],
        'Value for Money' => [
            'title' => 'Value for Money',
            'comment_prompt' => 'Is the funding amount requested for this project reasonable and does it provide good Value for the Money to the Treasury?',
        ],
    ];

    /**
     * Mapping from API fields to discussion titles
     */
    public const RATING_FIELD_MAP = [
        'impact_alignment_rating_given' => 'Impact',
        'feasibility_rating_given' => 'Feasibility',
        'auditability_rating_given' => 'Value for Money',
    ];

    public const NOTE_FIELD_MAP = [
        'impact_alignment_note' => 'Impact',
        'feasibility_note' => 'Feasibility',
        'auditability_note' => 'Value for Money',
    ];

    public function __invoke(): array
    {
        return self::DISCUSSION_TEMPLATES;
    }
}

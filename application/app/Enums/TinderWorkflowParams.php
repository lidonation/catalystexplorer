<?php

declare(strict_types=1);

namespace App\Enums;

use Spatie\Enum\Laravel\Enum;

/**
 * @method static self STEP()
 * @method static self EDIT()
 * @method static self TINDER_COLLECTION_HASH()
 * @method static self LEFT_BOOKMARK_COLLECTION_HASH()
 * @method static self RIGHT_BOOKMARK_COLLECTION_HASH()
 * @method static self SELECTED_FUND()
 * @method static self PROPOSAL_TYPES()
 * @method static self PROPOSAL_SIZES()
 * @method static self IMPACT_TYPES()
 * @method static self CAMPAIGNS()
 * @method static self FUNDS()
 * @method static self TITLE()
 * @method static self CONTENT()
 * @method static self VISIBILITY()
 * @method static self COMMENTS_ENABLED()
 * @method static self COLOR()
 * @method static self STATUS()
 * @method static self SWIPED_LEFT_PROPOSALS()
 * @method static self SWIPED_RIGHT_PROPOSALS()
 * @method static self CURRENT_INDEX()
 * @method static self TOTAL_PROPOSALS_SEEN()
 * @method static self PAGE()
 * @method static self LOAD_MORE()
 * @method static self SAVED_CURRENT_INDEX()
 * @method static self SAVED_TOTAL_SEEN()
 */
final class TinderWorkflowParams extends Enum
{
    protected static function values(): array
    {
        return [
            'STEP' => 'step',
            'EDIT' => 'edit',
            'TINDER_COLLECTION_HASH' => 'tinderCollectionHash',
            'LEFT_BOOKMARK_COLLECTION_HASH' => 'leftBookmarkCollectionHash',
            'RIGHT_BOOKMARK_COLLECTION_HASH' => 'rightBookmarkCollectionHash',
            'SELECTED_FUND' => 'selectedFund',
            'PROPOSAL_TYPES' => 'proposalTypes',
            'PROPOSAL_SIZES' => 'proposalSizes',
            'IMPACT_TYPES' => 'impactTypes',
            'CAMPAIGNS' => 'cam',
            'TITLE' => 'title',
            'CONTENT' => 'content',
            'VISIBILITY' => 'visibility',
            'COMMENTS_ENABLED' => 'comments_enabled',
            'COLOR' => 'color',
            'STATUS' => 'status',
            'SWIPED_LEFT_PROPOSALS' => 'swipedLeftProposals',
            'SWIPED_RIGHT_PROPOSALS' => 'swipedRightProposals',
            'CURRENT_INDEX' => 'currentIndex',
            'TOTAL_PROPOSALS_SEEN' => 'totalProposalsSeen',
            'PAGE' => 'p',
            'LOAD_MORE' => 'loadMore',
            'SAVED_CURRENT_INDEX' => 'savedCurrentIndex',
            'SAVED_TOTAL_SEEN' => 'savedTotalSeen',
            'FUNDS' => 'f',
        ];
    }
}

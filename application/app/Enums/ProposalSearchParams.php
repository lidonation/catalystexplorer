<?php

declare(strict_types=1);

namespace App\Enums;

use Spatie\Enum\Enum;

/**
 * @method static self AWARDED_ADA()
 * @method static self AWARDED_USD()
 * @method static self APPROVED_PROPOSALS()
 * @method static self COMPLETED_PROPOSALS()
 * @method static self BUDGETS()
 * @method static self CATEGORIES()
 * @method static self CAMPAIGNS()
 * @method static self COHORT()
 * @method static self COMMUNITIES()
 * @method static self CHART_OPTIONS()
 * @method static self CHART_TYPE()
 * @method static self FUNDS()
 * @method static self FUNDED_PROPOSALS()
 * @method static self FUNDING_STATUS()
 * @method static self GROUPS()
 * @method static self IN_PROGRESS_PROPOSALS()
 * @method static self LIMIT()
 * @method static self MAX_AWARDED_ADA()
 * @method static self MAX_AWARDED_USD()
 * @method static self MAX_BUDGET()
 * @method static self MAX_PROJECT_LENGTH()
 * @method static self MAX_PROPOSALS()
 * @method static self MIN_AWARDED_ADA()
 * @method static self MIN_AWARDED_USD()
 * @method static self MIN_BUDGET()
 * @method static self MIN_PROPOSALS()
 * @method static self MIN_PROJECT_LENGTH()
 * @method static self PROJECT_LENGTH()
 * @method static self OPENSOURCE_PROPOSALS()
 * @method static self SUBMITTED_PROPOSALS()
 * @method static self PROPOSALS()
 * @method static self PAGE()
 * @method static self IDEASCALE_PROFILES()
 * @method static self PROJECT_STATUS()
 * @method static self REVIEWER_IDS()
 * @method static self RATINGS()
 * @method static self REPUTATION_SCORES()
 * @method static self TREND_CHART()
 * @method static self HELPFUL()
 * @method static self QUERY()
 * @method static self QUICK_PITCHES()
 * @method static self UNFUNDED_PROPOSALS()
 * @method static self VIEW()
 * @method static self TAGS()
 * @method static self TYPE()
 * @method static self SORTS()
 */
final class ProposalSearchParams extends Enum
{
    protected static function values(): array
    {
        return [
            'AWARDED_ADA' => 'aa',
            'AWARDED_USD' => 'au',
            'APPROVED_PROPOSALS' => 'ap',
            'BUDGETS' => 'b',
            'CATEGORIES' => 'cat',
            'CAMPAIGNS' => 'cam',
            'COHORT' => 'coh',
            'COMMUNITIES' => 'com',
            'CHART_OPTIONS' => 'co',
            'CHART_TYPE' => 'ct',
            'COMPLETED_PROPOSALS' => 'cp',
            'FUNDS' => 'f',
            'FUNDING_STATUS' => 'fs',
            'GROUPS' => 'g',
            'IN_PROGRESS_PROPOSALS' => 'inp',
            'LIMIT' => 'l',
            'MAX_BUDGET' => 'bmax',
            'MAX_PROJECT_LENGTH' => 'lmax',
            'MIN_BUDGET' => 'bmin',
            'MIN_PROJECT_LENGTH' => 'lmin',
            'OPENSOURCE_PROPOSALS' => 'op',
            'SUBMITTED_PROPOSALS' => 'sp',
            'PROPOSALS' => 'pro',
            'PAGE' => 'p',
            'IDEASCALE_PROFILES' => 'ip',
            'PROJECT_STATUS' => 'ps',
            'REVIEWER_IDS' => 'ri',
            'RATINGS' => 'r',
            'REPUTATION_SCORES' => 'rs',
            'HELPFUL' => 'h',
            'QUERY' => 'q',
            'QUICK_PITCHES' => 'qp',
            'UNFUNDED_PROPOSALS' => 'ufp',
            'VIEW' => 'v',
            'SORTS' => 'st',
            'TAGS' => 't',
            'TYPE' => 'pt',
            'PROJECT_LENGTH' => 'pl',
        ];
    }
}

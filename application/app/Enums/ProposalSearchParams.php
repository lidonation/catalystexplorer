<?php declare(strict_types=1);

namespace App\Enums;

use Spatie\Enum\Enum;

/**
 * @method static self AWARDED_ADA()
 * @method static self AWARDED_USD()
 * @method static self BUDGETS()
 * @method static self CATEGORIES()
 * @method static self CAMPAIGNS()
 * @method static self COHORT()
 * @method static self COMMUNITIES()
 * @method static self FUNDS()
 * @method static self FUNDING_STATUS()
 * @method static self GROUPS()
 * @method static self LIMIT()
 * @method static self MAX_BUDGET()
 * @method static self MAX_PROJECT_LENGTH()
 * @method static self MIN_BUDGET()
 * @method static self MIN_PROJECT_LENGTH()
 * @method static self OPENSOURCE_PROPOSALS()
 * @method static self PAGE()
 * @method static self PEOPLE()
 * @method static self PROJECT_STATUS()
 * @method static self QUERY()
 * @method static self QUICK_PITCHES()
 * @method static self VIEW()
 * @method static self TAGS()
 * @method static self TYPE()
 */
final class ProposalSearchParams extends Enum
{
    protected static function values(): array
    {
        return [
            'AWARDED_ADA' => 'aa',
            'AWARDED_USD' => 'au',
            'BUDGETS' => 'b',
            'CATEGORIES' => 'cat',
            'CAMPAIGNS' => 'cam',
            'COHORT' => 'coh',
            'COMMUNITIES' => 'com',
            'FUNDS' => 'f',
            'FUNDING_STATUS' => 'fs',
            'GROUPS' => 'g',
            'LIMIT' => 'l',
            'MAX_BUDGET' => 'bmax',
            'MAX_PROJECT_LENGTH' => 'lmax',
            'MIN_BUDGET' => 'bmin',
            'MIN_PROJECT_LENGTH' => 'lmin',
            'OPENSOURCE_PROPOSALS' => 'op',
            'PAGE' => 'p',
            'PEOPLE' => 'pp',
            'PROJECT_STATUS' => 'ps',
            'QUERY' => 'q',
            'QUICK_PITCHES' => 'qp',
            'VIEW' => 'v',
            'SORTS' => 'st',
            'TAGS' => 't',
            'TYPE' => 'pt',
        ];
    }
}
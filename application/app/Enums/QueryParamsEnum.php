<?php

declare(strict_types=1);

namespace App\Enums;

use Spatie\Enum\Enum;

/**
 * @method static self AWARDED_ADA()
 * @method static self AWARDED_USD()
 * @method static self CAMPAIGNS()
 * @method static self COHORT()
 * @method static self COMMUNITIES()
 * @method static self FUNDED_PROPOSALS()
 * @method static self FUNDS()
 * @method static self IDEASCALE_PROFILES()
 * @method static self LIMIT()
 * @method static self PAGE()
 * @method static self QUERY()
 * @method static self SORTS()
 * @method static self TAGS()
 */
final class QueryParamsEnum extends Enum
{
    protected static function values(): array
    {
        return [
            'AWARDED_ADA' => 'aa',
            'AWARDED_USD' => 'au',
            'CAMPAIGNS' => 'cam',
            'COHORT' => 'coh',
            'COMMUNITIES' => 'com',
            'FUNDED_PROPOSALS' => 'fp',
            'FUNDS' => 'f',
            'IDEASCALE_PROFILES' => 'ip',
            'LIMIT' => 'l',
            'PAGE' => 'p',
            'QUERY' => 'q',
            'SORTS' => 'st',
            'TAGS' => 't',
        ];
    }
}

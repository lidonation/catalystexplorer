<?php

declare(strict_types=1);

namespace App\Enums;

use Spatie\Enum\Enum;

/**
 * @method static self LIMIT()
 * @method static self PAGE()
 * @method static self QUERY()
 * @method static self SECONDARY_QUERY()
 * @method static self SORTS()
 * @method static self VOTING_POWER()
 * @method static self VOTES_COUNT()
 * @method static self PROPOSALS_VOTED_ON()
 * @method static self FUND()
 * @method static self STAKE_KEY()
 * @method static self VOTING_KEY()
 */
final class VoterSearchParams extends Enum
{
    protected static function values(): array
    {
        return [
            'LIMIT' => 'l',
            'PAGE' => 'p',
            'QUERY' => 'q',
            'SORTS' => 'st',
            'VOTING_POWER' => 'vp',
            'VOTES_COUNT' => 'vc',
            'PROPOSALS_VOTED_ON' => 'pvo',
            'FUND' => 'f',
            'STAKE_KEY' => 'sk',
            'VOTING_KEY' => 'vk',
        ];
    }
}
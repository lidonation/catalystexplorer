<?php

declare(strict_types=1);

namespace App\Enums;

use Spatie\Enum\Enum;

/**
 * @method static self QUERY()
 * @method static self TYPE()
 * @method static self EPOCH()
 * @method static self TX_HASH()
 * @method static self BLOCK()
 * @method static self ADDRESS()
 * @method static self METADATA_LABELS()
 * @method static self DATE_RANGE()
 * @method static self PAGE()
 * @method static self LIMIT()
 * @method static self SORT()
 */
final class TransactionSearchParams extends Enum
{
    protected static function values(): array
    {
        return [
            'QUERY' => 'q',
            'TYPE' => 'ty',
            'EPOCH' => 'ep',
            'TX_HASH' => 'txh',
            'BLOCK' => 'blk',
            'ADDRESS' => 'addr',
            'METADATA_LABELS' => 'ml',
            'DATE_RANGE' => 'dr',
            'PAGE' => 'p',
            'LIMIT' => 'l',
            'SORT' => 'st',
        ];
    }
}

<?php

declare(strict_types=1);

namespace App\Enums;

use Spatie\Enum\Laravel\Enum;

/**
 * @method static self DRAFT()
 * @method static self PUBLISHED()
 */
final class MonthlyReportStatus extends Enum
{
    protected static function values(): array
    {
        return [
            'DRAFT' => '    draft',
            'PUBLISHED' => 'published',
        ];
    }
}

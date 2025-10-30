<?php

declare(strict_types=1);

namespace App\Enums;

use Spatie\Enum\Laravel\Enum;

/**
 * @method static self STEP()
 * @method static self COLLECTION_HASH()
 * @method static self CONVERSION_TYPE()
 */
final class ConvertListWorkflowParams extends Enum
{
    protected static function values(): array
    {
        return [
            'STEP' => 'step',
            'COLLECTION_HASH' => 'collectionHash',
            'CONVERSION_TYPE' => 'conversionType',
        ];
    }
}

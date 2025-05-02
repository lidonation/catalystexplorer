<?php

declare(strict_types=1);

namespace App\Enums;

use Spatie\Enum\Laravel\Enum;

/**
 * @method static self offered()
 * @method static self needed()
 */
final class ServiceTypeEnum extends Enum
{
    use Traits\HasValues;
}

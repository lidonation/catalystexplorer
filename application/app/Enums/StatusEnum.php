<?php

declare(strict_types=1);

namespace App\Enums;

use Spatie\Enum\Laravel\Enum;

/**
 * @method static self draft()
 * @method static self pending()
 * @method static self published()
 */
class StatusEnum extends Enum
{
    use Traits\HasValues;
}

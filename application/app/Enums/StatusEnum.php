<?php

declare(strict_types=1);

namespace App\Enums;

use Spatie\Enum\Laravel\Enum;

/**
 * @method static self draft()
 * @method static self pending()
 * @method static self published()
 * @method static self expired()
 * @method static self available()
 * @method static self claimed()
 * @method static self completed()
 * @method static self accepted()
 */
class StatusEnum extends Enum
{
    use Traits\HasValues;
}

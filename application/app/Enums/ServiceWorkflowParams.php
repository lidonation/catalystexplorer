<?php

declare(strict_types=1);

namespace App\Enums;

use Spatie\Enum\Laravel\Enum;

/**
 * @method static self STEP()
 * @method static self SERVICE_HASH()
 * @method static self TITLE()
 * @method static self DESCRIPTION()
 * @method static self TYPE()
 * @method static self HEADER_IMAGE()
 * @method static self HEADER_IMAGE_URL()
 * @method static self CATEGORIES()
 * @method static self LOCATION()
 * @method static self NAME()
 * @method static self EMAIL()
 * @method static self WEBSITE()
 * @method static self GITHUB()
 * @method static self LINKEDIN()
 */
final class ServiceWorkflowParams extends Enum
{
    protected static function values(): array
    {
        return [
            'STEP' => 'step',
            'SERVICE_HASH' => 'serviceHash',
            'TITLE' => 'title',
            'DESCRIPTION' => 'description',
            'TYPE' => 'type',
            'HEADER_IMAGE' => 'header_image',
            'HEADER_IMAGE_URL' => 'header_image_url',
            'CATEGORIES' => 'categories',
            'LOCATION' => 'location',
            'NAME' => 'name',
            'EMAIL' => 'email',
            'WEBSITE' => 'website',
            'GITHUB' => 'github',
            'LINKEDIN' => 'linkedin',
        ];
    }
}

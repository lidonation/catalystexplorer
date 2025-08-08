<?php

declare(strict_types=1);

namespace App\Traits;

use ApiPlatform\Metadata\ApiResource;

/**
 * Trait to register models as API Platform resources
 */
trait IsApiResource
{
    public static function bootIsApiResource(): void
    {
        // Register this model as an API Platform resource
        static::$apiResourceMetadata = static::apiResource();
    }

    /**
     * Define the API resource configuration
     * This method should be overridden in the model
     */
    public static function apiResource(): ApiResource
    {
        return new ApiResource();
    }
}

<?php

declare(strict_types=1);

namespace App\Casts;

use App\DataTransferObjects\CatalystProfileData;
use App\DataTransferObjects\IdeascaleProfileData;
use App\Models\CatalystProfile;
use App\Models\IdeascaleProfile;
use Spatie\LaravelData\Casts\Cast;
use Spatie\LaravelData\Support\Creation\CreationContext;
use Spatie\LaravelData\Support\DataProperty;

class ProfileModelCast implements Cast
{
    public function cast(DataProperty $property, mixed $value, array $properties, CreationContext $context): IdeascaleProfileData|CatalystProfileData
    {
        if ($value instanceof IdeascaleProfile) {
            $value->load('claimed_profiles');

            return IdeascaleProfileData::from($value);
        }

        if ($value instanceof CatalystProfile) {
            $value->load('claimed_profiles');

            return CatalystProfileData::from($value);
        }

        if ($value instanceof IdeascaleProfileData || $value instanceof CatalystProfileData) {
            return $value;
        }

        throw new \InvalidArgumentException('Invalid profile model type');
    }
}

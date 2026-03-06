<?php

declare(strict_types=1);

namespace App\DataTransferObjects\Casts;

use App\DataTransferObjects\CommunityData;
use App\DataTransferObjects\GroupData;
use App\DataTransferObjects\IdeascaleProfileData;
use App\DataTransferObjects\ProposalData;
use App\DataTransferObjects\ReviewData;
use App\Models\Community;
use App\Models\Group;
use App\Models\IdeascaleProfile;
use App\Models\Proposal;
use App\Models\Review;
use Spatie\LaravelData\Casts\Cast;
use Spatie\LaravelData\Support\Creation\CreationContext;
use Spatie\LaravelData\Support\DataProperty;

class PolymorphicModelCast implements Cast
{
    public function cast(DataProperty $property, mixed $value, array $properties, CreationContext $context): mixed
    {
        if ($value === null) {
            return null;
        }

        // If it's already a DTO, return as-is
        if ($value instanceof ProposalData ||
            $value instanceof ReviewData ||
            $value instanceof IdeascaleProfileData ||
            $value instanceof CommunityData ||
            $value instanceof GroupData) {
            return $value;
        }

        // Convert Eloquent model to appropriate DTO
        if ($value instanceof Proposal) {
            return ProposalData::from($value);
        }
        if ($value instanceof Review) {
            return ReviewData::from($value);
        }
        if ($value instanceof IdeascaleProfile) {
            return IdeascaleProfileData::from($value);
        }
        if ($value instanceof Community) {
            return CommunityData::from($value);
        }
        if ($value instanceof Group) {
            return GroupData::from($value);
        }

        // Handle array data by checking model_type from properties
        if (is_array($value)) {
            $modelType = $properties['model_type'] ?? null;

            return match ($modelType) {
                Proposal::class => ProposalData::from($value),
                Review::class => ReviewData::from($value),
                IdeascaleProfile::class => IdeascaleProfileData::from($value),
                Community::class => CommunityData::from($value),
                Group::class => GroupData::from($value),
                default => null,
            };
        }

        return null;
    }
}

<?php

declare(strict_types=1);

namespace App\DataTransferObjects\Casts;

use App\DataTransferObjects\RatingData;
use Spatie\LaravelData\Casts\Cast;
use Spatie\LaravelData\Support\Creation\CreationContext;
use Spatie\LaravelData\Support\DataProperty;

class ReviewRatingCast implements Cast
{
    public function cast(DataProperty $property, mixed $value, array $properties, CreationContext $context): mixed
    {
        if ($value === null) {
            return null;
        }

        if (is_int($value)) {
            return $value;
        }

        if ($value instanceof RatingData) {
            return $value;
        }

        if (is_array($value)) {
            // If it's an array with rating data, convert to RatingData
            if (isset($value['rating'], $value['review_id'], $value['model_id'])) {
                return RatingData::from($value);
            }
            // If it's just an array with a rating key, return the rating value
            if (isset($value['rating']) && is_int($value['rating'])) {
                return $value['rating'];
            }
        }

        // If it's a string that can be converted to int, convert it
        if (is_string($value) && is_numeric($value)) {
            return (int) $value;
        }

        return null;
    }
}

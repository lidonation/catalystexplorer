<?php

declare(strict_types=1);

namespace App\DataTransferObjects;

use Spatie\LaravelData\Data;
use Spatie\TypeScriptTransformer\Attributes\TypeScript;

#[TypeScript]
class RatingData extends Data
{
    public function __construct(
        public int $rating,
        public int $review_id,
        public int $model_id,
    ) {}
}

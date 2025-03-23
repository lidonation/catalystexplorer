<?php

declare(strict_types=1);

namespace App\DataTransferObjects;

use Carbon\Carbon;
use Spatie\LaravelData\Data;
use Spatie\TypeScriptTransformer\Attributes\Optional as TypeScriptOptional;
use Spatie\TypeScriptTransformer\Attributes\TypeScript;

#[TypeScript]
class ReviewData extends Data
{
    public function __construct(
        public ?string $id,

        public ?string $hash,

        #[TypeScriptOptional]
        public ?int $parent_id,

        #[TypeScriptOptional]
        public ?int $user_id,

        public ?int $model_id,

        public ?string $model_type,

        #[TypeScriptOptional]
        public string $title,

        public string $content,

        public ?string $status,

        /*  #[TypeScriptOptional]
         public ?Carbon $published_at,
 */
        public ?string $type,

        public ?int $ranking_total,

        public ?int $helpful_total,

        public ?int $not_helpful_total,
    ) {}
}

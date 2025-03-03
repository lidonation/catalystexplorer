<?php

declare(strict_types=1);

use Spatie\LaravelData\Data;
use Spatie\TypeScriptTransformer\Attributes\Optional as TypeScriptOptional;

final class DiscussionData extends Data
{
    public function __construct(
        #[TypeScriptOptional]
        public ?int $hash,

        #[TypeScriptOptional]
        public ?int $user_id,

        public int $model_id,

        public string $model_type,

        public string $content,

        public string $comment_prompt,

        public string $status,

        public int $order,

    ) {}
}

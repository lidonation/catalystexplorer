<?php

declare(strict_types=1);

namespace App\DataTransferObjects;

use Spatie\LaravelData\Data;
use Spatie\TypeScriptTransformer\Attributes\Optional as TypeScriptOptional;
use Spatie\TypeScriptTransformer\Attributes\TypeScript;

#[TypeScript]
final class MediaData extends Data
{
    public function __construct(
        public ?string $id,

        #[TypeScriptOptional]
        public ?string $model_type,

        #[TypeScriptOptional]
        public ?string $model_id,

        #[TypeScriptOptional]
        public ?string $uuid,

        #[TypeScriptOptional]
        public ?string $collection_name,

        public ?string $name,

        #[TypeScriptOptional]
        public ?string $file_name,

        #[TypeScriptOptional]
        public ?string $mime_type,

        #[TypeScriptOptional]
        public ?string $disk,

        #[TypeScriptOptional]
        public ?string $conversions_disk,

        #[TypeScriptOptional]
        public ?int $size,

        /**
         * @var array<string, mixed>|null
         */
        #[TypeScriptOptional]
        public ?array $manipulations,

        /**
         * @var array<string, mixed>|null
         */
        #[TypeScriptOptional]
        public ?array $custom_properties,

        /**
         * @var array<string, mixed>|null
         */
        #[TypeScriptOptional]
        public ?array $generated_conversions,

        /**
         * @var array<string, mixed>|null
         */
        #[TypeScriptOptional]
        public ?array $responsive_images,

        #[TypeScriptOptional]
        public ?int $order_column,

        #[TypeScriptOptional]
        public ?string $created_at,

        #[TypeScriptOptional]
        public ?string $updated_at,

        // Additional computed/helper attributes that might be useful
        #[TypeScriptOptional]
        public ?string $url,

        #[TypeScriptOptional]
        public ?string $full_url,

        /**
         * @var array<string, string>|null
         */
        #[TypeScriptOptional]
        public ?array $conversion_urls,

        #[TypeScriptOptional]
        public ?string $human_readable_size,

        #[TypeScriptOptional]
        public ?bool $has_generated_conversions,

        #[TypeScriptOptional]
        public ?string $extension,

        #[TypeScriptOptional]
        public ?bool $is_image,

        #[TypeScriptOptional]
        public ?bool $is_video,

        #[TypeScriptOptional]
        public ?bool $is_audio,

        #[TypeScriptOptional]
        public ?bool $is_document,
    ) {}
}

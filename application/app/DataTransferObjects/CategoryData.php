<?php

declare(strict_types=1);

namespace App\DataTransferObjects;

use App\Models\Category;
use Spatie\LaravelData\Attributes\DataCollectionOf;
use Spatie\LaravelData\Attributes\MapOutputName;
use Spatie\LaravelData\Data;
use Spatie\LaravelData\DataCollection;
use Spatie\TypeScriptTransformer\Attributes\Optional as TypeScriptOptional;
use Spatie\TypeScriptTransformer\Attributes\TypeScript;

#[TypeScript]
final class CategoryData extends Data
{
    public function __construct(
        public int $id,
        public string $name,
        public string $slug,
        public string $type,
        public int $level,
        public bool $is_active,

        #[TypeScriptOptional]
        public ?string $description,

        #[TypeScriptOptional]
        public ?int $parent_id,

        #[TypeScriptOptional]
        #[DataCollectionOf(self::class)]
        public ?DataCollection $children,

        #[TypeScriptOptional]
        #[DataCollectionOf(ServiceData::class)]
        public ?DataCollection $services,

        #[MapOutputName('created_at')]
        #[TypeScriptOptional]
        public ?string $created_at,

        #[MapOutputName('updated_at')]
        #[TypeScriptOptional]
        public ?string $updated_at
    ) {}

    public static function fromModel(Category $category): self
    {
        return new self(
            id: $category->id,
            name: $category->name,
            slug: $category->slug,
            type: $category->type,
            level: $category->level,
            is_active: $category->is_active,
            description: $category->description,
            parent_id: $category->parent_id,
            children: $category->relationLoaded('children')
                ? self::collection($category->children)
                : null,
            services: $category->relationLoaded('services')
                ? ServiceData::collection($category->services)
                : null,
            created_at: $category->created_at?->toIso8601String(),
            updated_at: $category->updated_at?->toIso8601String()
        );
    }

    public static function basic(Category $category): array
    {
        return [
            'id' => $category->id,
            'name' => $category->name,
            'slug' => $category->slug,
            'type' => $category->type,
        ];
    }
}

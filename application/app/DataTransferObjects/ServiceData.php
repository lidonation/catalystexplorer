<?php

declare(strict_types=1);

namespace App\DataTransferObjects;

use Spatie\LaravelData\Attributes\DataCollectionOf;
use Spatie\LaravelData\Data;
use Spatie\LaravelData\DataCollection;
use Spatie\TypeScriptTransformer\Attributes\Optional as TypeScriptOptional;
use Spatie\TypeScriptTransformer\Attributes\TypeScript;

#[TypeScript]
final class ServiceData extends Data
{
    public function __construct(
        public ?string $hash,

        public string $title,

        public string $description,

        public ServiceTypeEnum $type,

        #[TypeScriptOptional]
        public ?string $header_image_url,

        #[TypeScriptOptional]
        public ?string $name,

        #[TypeScriptOptional]
        public ?string $email,

        #[TypeScriptOptional]
        public ?string $website,

        #[DataCollectionOf(CategoryData::class)]
        public ?DataCollection $categories,

        #[DataCollectionOf(LocationData::class)]
        public ?DataCollection $locations,

        #[TypeScriptOptional]
        public ?UserData $user,

        #[TypeScriptOptional]
        public ?string $created_at,

        #[TypeScriptOptional]
        public ?string $updated_at,

        #[TypeScriptOptional]
        public ?array $effective_details,

        #[TypeScriptOptional]
        public ?string $link
    ) {}

    public static function fromModel(Service $service): self
    {
        return new self(
            hash: $service->hash,
            title: $service->title,
            description: $service->description,
            type: $service->type,
            header_image_url: $service->header_image_url,
            name: $service->name,
            email: $service->email,
            website: $service->website,
            categories: $service->relationLoaded('categories')
                ? CategoryData::collection($service->categories)
                : null,
            locations: $service->relationLoaded('locations')
                ? LocationData::collection($service->locations)
                : null,
            user: $service->relationLoaded('user')
                ? UserData::from($service->user)
                : null,
            effective_details: $service->effective_details,
            link: route('services.show', $service)
        );
    }
}

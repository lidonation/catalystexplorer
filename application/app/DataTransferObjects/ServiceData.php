<?php

declare(strict_types=1);

namespace App\DataTransferObjects;

use App\Enums\ServiceTypeEnum;
use App\Models\Service;
use Spatie\LaravelData\Data;
use Spatie\TypeScriptTransformer\Attributes\Optional as TypeScriptOptional;
use Spatie\TypeScriptTransformer\Attributes\TypeScript;

#[TypeScript]
final class ServiceData extends Data
{
    public function __construct(
        public ?string $id,

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

        #[TypeScriptOptional]
        public ?array $categories,

        #[TypeScriptOptional]
        public ?array $locations,

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
            id: $service->id,
            title: $service->title,
            description: $service->description,
            type: $service->type,
            header_image_url: $service->header_image_url,
            name: $service->name,
            email: $service->email,
            website: $service->website,
            categories: $service->relationLoaded('categories')
                ? $service->categories->map(fn ($cat) => [
                    'id' => $cat->id,
                    'name' => $cat->name,
                    'slug' => $cat->slug,
                ])->toArray()
                : null,
            locations: $service->relationLoaded('locations')
                ? $service->locations->map(fn ($loc) => [
                    'id' => $loc->id,
                    'city' => $loc->city,
                    'region' => $loc->region ?? null,
                ])->toArray()
                : null,
            user: $service->relationLoaded('user')
                ? UserData::from($service->user)
                : null,
            created_at: $service->created_at?->toISOString(),
            updated_at: $service->updated_at?->toISOString(),
            effective_details: $service->effective_contact_details ?? null,
            link: route('services.show', $service->id)
        );
    }
}

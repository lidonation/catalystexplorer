<?php

declare(strict_types=1);

namespace App\DataTransferObjects;

use Spatie\LaravelData\Data;
use Spatie\TypeScriptTransformer\Attributes\Optional as TypeScriptOptional;
use Spatie\TypeScriptTransformer\Attributes\TypeScript;

#[TypeScript]
class LocationData extends Data
{
    public function __construct(
        public ?int $id,

        public string $country,

        public string $city,

        #[TypeScriptOptional]
        public ?string $region,

        #[TypeScriptOptional]
        public ?string $street,

        #[TypeScriptOptional]
        public ?string $address_1,

        #[TypeScriptOptional]
        public ?string $address_2,

        #[TypeScriptOptional]
        public ?float $lat,

        #[TypeScriptOptional]
        public ?float $long,

    ) {}
}

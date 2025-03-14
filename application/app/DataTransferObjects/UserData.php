<?php

declare(strict_types=1);

namespace App\DataTransferObjects;

use Spatie\LaravelData\Attributes\DataCollectionOf;
use Spatie\LaravelData\Data;
use Spatie\LaravelData\DataCollection;
use Spatie\TypeScriptTransformer\Attributes\TypeScript;

#[TypeScript]
class UserData extends Data
{
    public function __construct(
        public string $hash,

        public int $id,

        public string $name,

        public string $email,

        public ?string $hero_img_url,

        public ?string $email_verified_at,

        #[DataCollectionOf(LocationData::class)]
        public ?DataCollection $locations,
    ) {}
}

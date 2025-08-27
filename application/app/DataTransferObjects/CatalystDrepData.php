<?php

declare(strict_types=1);

namespace App\DataTransferObjects;

use Spatie\LaravelData\Data;
use Spatie\TypeScriptTransformer\Attributes\TypeScript;

#[TypeScript]
final class CatalystDrepData extends Data
{
    public function __construct(
        public ?string $id,

        public ?string $name,

        public ?string $email,

        public ?string $link,

        public ?string $bio,

        public ?string $motivation,

        public ?string $qualifications,

        public ?string $objective,

        public ?string $stake_address,

        public ?int $voting_power,

        public ?string $last_active,

        public ?string $status,

        public ?string $locale,

        public ?int $delegators_count

    ) {}
}

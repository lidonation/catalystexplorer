<?php

declare(strict_types=1);

namespace App\DataTransferObjects;

use Spatie\LaravelData\Data;
use Spatie\TypeScriptTransformer\Attributes\TypeScript;

#[TypeScript]
class UserData extends Data
{
    public function __construct(
        public int $id,

        public string $name,

        public string $email,

        public string $profile_photo_url,

        public ?string $email_verified_at = null
    ) {}
}

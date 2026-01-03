<?php

declare(strict_types=1);

namespace App\DataTransferObjects;

use App\Casts\ProfileModelCast;
use Spatie\LaravelData\Attributes\WithCast;
use Spatie\LaravelData\Data;
use Spatie\TypeScriptTransformer\Attributes\Optional as TypeScriptOptional;
use Spatie\TypeScriptTransformer\Attributes\TypeScript;

#[TypeScript]
final class ProposalProfileData extends Data
{
    public function __construct(
        #[TypeScriptOptional]
        public ?string $id,

        #[TypeScriptOptional]
        public ?ProposalData $proposal,

        #[WithCast(ProfileModelCast::class)]
        public IdeascaleProfileData|CatalystProfileData $model
    ) {}
}

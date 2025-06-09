<?php

declare(strict_types=1);

namespace App\DataTransferObjects;

use Spatie\LaravelData\Data;
use Spatie\TypeScriptTransformer\Attributes\Optional as TypeScriptOptional;
use Spatie\TypeScriptTransformer\Attributes\TypeScript;

#[TypeScript]
final class VoterData extends Data
{
    public function __construct(
        public int $id,

        #[TypeScriptOptional]
        public ?string $hash,

        #[TypeScriptOptional]
        public ?string $stake_pub,

        #[TypeScriptOptional]
        public ?string $stake_key,

        #[TypeScriptOptional]
        public ?string $voting_pub,

        #[TypeScriptOptional]
        public ?string $voting_key,

        #[TypeScriptOptional]
        public ?string $cat_id,

        #[TypeScriptOptional]
        public ?float $voting_power,

        #[TypeScriptOptional]
        public ?int $votes_count,

        #[TypeScriptOptional]
        public ?int $proposals_voted_on,

        #[TypeScriptOptional]
        public ?string $created_at,

        #[TypeScriptOptional]
        public ?string $updated_at,

        #[TypeScriptOptional]
        public ?string $deleted_at,

        #[TypeScriptOptional]
        public ?FundData $latest_fund,

    ) {}
}

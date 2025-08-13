<?php

declare(strict_types=1);

namespace App\DataTransferObjects;

use Spatie\LaravelData\Data;
use Spatie\TypeScriptTransformer\Attributes\Optional as TypeScriptOptional;
use Spatie\TypeScriptTransformer\Attributes\TypeScript;

#[TypeScript]
final class VoterHistoryData extends Data
{
    public function __construct(
        public ?string $id,

        #[TypeScriptOptional]
        public ?string $stake_address,

        #[TypeScriptOptional]
        public ?string $fragment_id,

        #[TypeScriptOptional]
        public ?string $caster,

        #[TypeScriptOptional]
        public ?string $time,

        #[TypeScriptOptional]
        public ?string $raw_fragment,

        #[TypeScriptOptional]
        public ?int $proposal,

        #[TypeScriptOptional]
        public ?int $choice,

        #[TypeScriptOptional]
        public ?int $snapshot_id,

        #[TypeScriptOptional]
        public ?string $created_at,

        #[TypeScriptOptional]
        public ?string $updated_at,

        #[TypeScriptOptional]
        public ?string $deleted_at,

        #[TypeScriptOptional]
        public ?float $voting_power,

        #[TypeScriptOptional]
        public ?SnapshotData $snapshot,

        #[TypeScriptOptional]
        public FundData|string|null $fund,
    ) {}
}

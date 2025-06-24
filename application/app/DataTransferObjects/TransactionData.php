<?php

declare(strict_types=1);

namespace App\DataTransferObjects;

use Spatie\LaravelData\Data;
use Spatie\TypeScriptTransformer\Attributes\TypeScript;

#[TypeScript]
class TransactionData extends Data
{
    public function __construct(
        public ?string $hash,
        public string $tx_hash,
        public string $block,
        public ?string $witness,
        public ?string $stake_key,
        public ?string $type,
        public ?int $epoch,
        public ?int $total_output,
        public ?string $stake_pub,
        public mixed $json_metadata,
        public null|object|array $raw_metadata,
        public string $created_at,
        /** @var array<TransactionInputData> */
        public array $inputs,
        /** @var array<TransactionOutputData> */
        public array $outputs,
    ) {}
}

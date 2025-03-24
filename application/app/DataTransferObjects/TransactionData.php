<?php

declare(strict_types=1);

namespace App\DataTransferObjects;

use Spatie\LaravelData\Data;
use Spatie\TypeScriptTransformer\Attributes\TypeScript;

#[TypeScript]
class TransactionData extends Data
{
    public function __construct(
        public string $tx_hash,

        public ?int $epoch,

        public string $block,

        public ?object $json_metadata,

        public ?object $raw_metadata,

        public ?string $created_at,

        public ?array $inputs,

        public $outputs,
    ) {}
}

<?php

declare(strict_types=1);

namespace App\DataTransferObjects;

use Spatie\LaravelData\Data;
use Spatie\TypeScriptTransformer\Attributes\TypeScript;

#[TypeScript]
class TransactionInputData extends Data
{
    public function __construct(
        public string $address,
        public array $amount,
        public string $tx_hash,
        public int $output_index,
        public ?string $data_hash,
        public ?object $inline_datum,
        public ?string $reference_script_hash,
        public bool $collateral,
        public bool $reference,
    ) {}
}

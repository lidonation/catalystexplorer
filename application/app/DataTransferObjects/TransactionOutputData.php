<?php

declare(strict_types=1);

namespace App\DataTransferObjects;

use Spatie\LaravelData\Data;
use Spatie\TypeScriptTransformer\Attributes\TypeScript;

#[TypeScript]
class TransactionOutputData extends Data
{
    public function __construct(
        public string $address,
        public array $amount,
        public int $output_index,
        public ?string $data_hash,
        public ?object $inline_datum,
        public bool $collateral,
        public ?string $reference_script_hash,
        public ?string $consumed_by_tx,
    ) {}
}

<?php

declare(strict_types=1);

namespace App\DataTransferObjects;

use Spatie\LaravelData\Data;
use Spatie\TypeScriptTransformer\Attributes\Optional as TypeScriptOptional;
use Spatie\TypeScriptTransformer\Attributes\TypeScript;

#[TypeScript]
final class LinkData extends Data
{
    public function __construct(
        public string $id,
        public string $link,
        public string $type,
        
        #[TypeScriptOptional]
        public ?string $title,
        
        #[TypeScriptOptional]
        public ?string $label,
        
        #[TypeScriptOptional]
        public ?string $status,
        
        #[TypeScriptOptional]
        public ?bool $valid,
        
        #[TypeScriptOptional]
        public ?int $order,
    ) {}
}

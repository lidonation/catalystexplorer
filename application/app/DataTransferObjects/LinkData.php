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

        #[TypeScriptOptional]
        public ?string $modelType,

        #[TypeScriptOptional]
        public ?string $modelId,

        #[TypeScriptOptional]
        public ?ProposalData $proposal,

        #[TypeScriptOptional]
        public ?ServiceData $service,

        #[TypeScriptOptional]
        public ?string $createdAt,

        #[TypeScriptOptional]
        public ?string $updatedAt,
    ) {}

    public function getRelatedModel(): ?Data
    {
        return match ($this->modelType) {
            'App\\Models\\Proposal' => $this->proposal,
            'App\\Models\\Service' => $this->service,
            default => null,
        };
    }

    public function getModelTypeLabel(): string
    {
        return match ($this->modelType) {
            'App\\Models\\Proposal' => 'Proposal',
            'App\\Models\\Service' => 'Service',
            default => 'Unknown',
        };
    }
}

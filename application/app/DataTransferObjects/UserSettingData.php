<?php

declare(strict_types=1);

namespace App\DataTransferObjects;

use Spatie\LaravelData\Data;
use Spatie\TypeScriptTransformer\Attributes\TypeScript;

#[TypeScript]
class UserSettingData extends Data
{
    public function __construct(
        public string $language,
        public string $theme,
        public string $viewChartBy,
        public array $proposalComparison,
        public array $proposalType,
        public array $chartOptions,
        public array $chartType,
        public array $viewHorizontal,
        public array $viewMini,
        public array $viewTable,
        public array $proposalPdfColumns,
        public bool $groupByCategories,
        public ?string $preferredCurrency = null,
        public ?array $ogCardConfig = null,
    ) {}
}

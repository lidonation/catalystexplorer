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
        public string $trendChart,
        public array $chartTypes
    ) {}
}

<?php

declare(strict_types=1);

namespace App\Tools;

use App\Models\ModelEmbedding;
use App\Models\Proposal;
use Illuminate\Support\Facades\DB;
use Vizra\VizraADK\Contracts\ToolInterface;
use Vizra\VizraADK\Memory\AgentMemory;
use Vizra\VizraADK\System\AgentContext;

class ProposalAnalyticsTool implements ToolInterface
{
    public function definition(): array
    {
        return [
            'name' => 'analyze_proposals',
            'description' => 'Analyze Project Catalyst proposals with filtering by time periods, funds, funding status, and amounts. Can answer questions like "how many proposals were funded in 2020" or "what was the average funding in Fund 9".',
            'parameters' => [
                'type' => 'object',
                'properties' => [
                    'metric' => [
                        'type' => 'string',
                        'enum' => ['count', 'sum', 'average', 'max', 'min', 'list'],
                        'description' => 'The metric to calculate: count (number of proposals), sum (total amount), average (average amount), max/min (highest/lowest amounts), or list (show individual proposals)',
                        'default' => 'count'
                    ],
                    'funding_year' => [
                        'type' => 'integer',
                        'description' => 'Filter by funding year (e.g., 2020, 2021, 2022, etc.)',
                    ],
                    'fund_label' => [
                        'type' => 'string', 
                        'description' => 'Filter by fund label (e.g., "Fund8", "Fund9", "Fund10", etc.)',
                    ],
                    'is_funded' => [
                        'type' => 'boolean',
                        'description' => 'Filter by funding status: true for funded proposals only, false for non-funded, omit for all',
                    ],
                    'min_amount' => [
                        'type' => 'number',
                        'description' => 'Minimum requested amount filter',
                    ],
                    'max_amount' => [
                        'type' => 'number',
                        'description' => 'Maximum requested amount filter',
                    ],
                    'currency' => [
                        'type' => 'string',
                        'description' => 'Filter by currency (e.g., "ADA", "USD")',
                    ],
                    'limit' => [
                        'type' => 'integer',
                        'description' => 'Maximum number of results to return for list metric (default: 10)',
                        'default' => 10,
                        'maximum' => 50,
                    ],
                ],
                'required' => [],
            ],
        ];
    }

    public function execute(array $arguments, AgentContext $context, AgentMemory $memory): string
    {
        try {
            $metric = $arguments['metric'] ?? 'count';
            $fundingYear = $arguments['funding_year'] ?? null;
            $fundLabel = $arguments['fund_label'] ?? null;
            $isFunded = $arguments['is_funded'] ?? null;
            $minAmount = $arguments['min_amount'] ?? null;
            $maxAmount = $arguments['max_amount'] ?? null;
            $currency = $arguments['currency'] ?? null;
            $limit = min($arguments['limit'] ?? 10, 50);

            // Build query
            $query = ModelEmbedding::where('embeddable_type', Proposal::class)
                ->whereNotNull('funding_year'); // Only include embeddings with metadata

            // Apply filters
            if ($fundingYear) {
                $query->where('funding_year', $fundingYear);
            }

            if ($fundLabel) {
                $query->where('fund_label', $fundLabel);
            }

            if ($isFunded !== null) {
                $query->where('is_funded', $isFunded);
            }

            if ($minAmount) {
                $query->where('amount_requested', '>=', $minAmount);
            }

            if ($maxAmount) {
                $query->where('amount_requested', '<=', $maxAmount);
            }

            if ($currency) {
                $query->where('currency', $currency);
            }

            // Execute based on metric
            switch ($metric) {
                case 'count':
                    $result = $query->count();
                    return $this->formatCountResult($result, $arguments);

                case 'sum':
                    $result = $query->sum('amount_requested');
                    return $this->formatSumResult($result, $arguments);

                case 'average':
                    $result = $query->avg('amount_requested');
                    return $this->formatAverageResult($result, $arguments);

                case 'max':
                    $result = $query->max('amount_requested');
                    return $this->formatMaxResult($result, $arguments);

                case 'min':
                    $result = $query->min('amount_requested');
                    return $this->formatMinResult($result, $arguments);

                case 'list':
                    $embeddings = $query->with('embeddable')
                        ->orderByDesc('amount_requested')
                        ->limit($limit)
                        ->get();
                    return $this->formatListResult($embeddings, $arguments);

                default:
                    return "Unknown metric: {$metric}";
            }

        } catch (\Exception $e) {
            return "Error analyzing proposals: " . $e->getMessage();
        }
    }

    private function formatCountResult(int $count, array $arguments): string
    {
        $filters = $this->buildFilterDescription($arguments);
        
        return "Found **{$count} proposals** " . $filters;
    }

    private function formatSumResult(?float $sum, array $arguments): string
    {
        $filters = $this->buildFilterDescription($arguments);
        $currency = $arguments['currency'] ?? 'ADA';
        
        if ($sum === null) {
            return "No proposals found " . $filters;
        }
        
        $formattedSum = number_format($sum, 2);
        
        return "Total requested amount: **{$formattedSum} {$currency}** " . $filters;
    }

    private function formatAverageResult(?float $average, array $arguments): string
    {
        $filters = $this->buildFilterDescription($arguments);
        $currency = $arguments['currency'] ?? 'ADA';
        
        if ($average === null) {
            return "No proposals found " . $filters;
        }
        
        $formattedAvg = number_format($average, 2);
        
        return "Average requested amount: **{$formattedAvg} {$currency}** " . $filters;
    }

    private function formatMaxResult(?float $max, array $arguments): string
    {
        $filters = $this->buildFilterDescription($arguments);
        $currency = $arguments['currency'] ?? 'ADA';
        
        if ($max === null) {
            return "No proposals found " . $filters;
        }
        
        $formattedMax = number_format($max, 2);
        
        return "Highest requested amount: **{$formattedMax} {$currency}** " . $filters;
    }

    private function formatMinResult(?float $min, array $arguments): string
    {
        $filters = $this->buildFilterDescription($arguments);
        $currency = $arguments['currency'] ?? 'ADA';
        
        if ($min === null) {
            return "No proposals found " . $filters;
        }
        
        $formattedMin = number_format($min, 2);
        
        return "Lowest requested amount: **{$formattedMin} {$currency}** " . $filters;
    }

    private function formatListResult($embeddings, array $arguments): string
    {
        $filters = $this->buildFilterDescription($arguments);
        
        if ($embeddings->isEmpty()) {
            return "No proposals found " . $filters;
        }

        $result = "Found **{$embeddings->count()} proposals** " . $filters . "\n\n";

        foreach ($embeddings as $index => $embedding) {
            $proposal = $embedding->embeddable;
            if (!$proposal) continue;

            $title = $this->extractTitle($proposal);
            $fundedStatus = $embedding->is_funded ? '✅ FUNDED' : '⏳ Not Funded';
            $amount = number_format($embedding->amount_requested, 2);
            
            $result .= ($index + 1) . ". **{$title}**\n";
            $result .= "   💰 Requested: {$amount} {$embedding->currency}\n";
            $result .= "   📊 Fund: {$embedding->fund_label}\n";
            $result .= "   📅 Year: {$embedding->funding_year}\n";
            $result .= "   {$fundedStatus}\n";
            if ($proposal->link) {
                $result .= "   🔗 View: {$proposal->link}\n";
            }
            $result .= "\n";
        }

        return $result;
    }

    private function buildFilterDescription(array $arguments): string
    {
        $parts = [];
        
        if (isset($arguments['funding_year'])) {
            $parts[] = "in {$arguments['funding_year']}";
        }
        
        if (isset($arguments['fund_label'])) {
            $parts[] = "from {$arguments['fund_label']}";
        }
        
        if (isset($arguments['is_funded'])) {
            $parts[] = $arguments['is_funded'] ? "that were funded" : "that were not funded";
        }
        
        if (isset($arguments['min_amount']) || isset($arguments['max_amount'])) {
            $min = $arguments['min_amount'] ?? null;
            $max = $arguments['max_amount'] ?? null;
            $currency = $arguments['currency'] ?? 'ADA';
            
            if ($min && $max) {
                $parts[] = "requesting between {$min}-{$max} {$currency}";
            } elseif ($min) {
                $parts[] = "requesting at least {$min} {$currency}";
            } elseif ($max) {
                $parts[] = "requesting at most {$max} {$currency}";
            }
        }
        
        if (isset($arguments['currency']) && !isset($arguments['min_amount']) && !isset($arguments['max_amount'])) {
            $parts[] = "using {$arguments['currency']} currency";
        }
        
        return empty($parts) ? "" : "(" . implode(", ", $parts) . ")";
    }

    private function extractTitle($proposal): string
    {
        if (!$proposal) return 'Unknown Proposal';
        
        $title = $proposal->title;
        
        if (is_array($title)) {
            return $title['en'] ?? array_values($title)[0] ?? 'Untitled';
        }
        
        if (is_string($title)) {
            $decoded = json_decode($title, true);
            if (is_array($decoded)) {
                return $decoded['en'] ?? array_values($decoded)[0] ?? 'Untitled';
            }
            return $title;
        }
        
        return 'Untitled';
    }
}
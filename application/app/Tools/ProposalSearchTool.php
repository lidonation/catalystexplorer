<?php

declare(strict_types=1);

namespace App\Tools;

use App\Models\ModelEmbedding;
use App\Models\Proposal;
use App\Services\EmbeddingService;
use Illuminate\Support\Collection;
use Vizra\VizraADK\Contracts\ToolInterface;
use Vizra\VizraADK\Memory\AgentMemory;
use Vizra\VizraADK\System\AgentContext;

class ProposalSearchTool implements ToolInterface
{
    public function __construct(
        private EmbeddingService $embeddingService
    ) {}

    public function definition(): array
    {
        return [
            'name' => 'search_proposals',
            'description' => 'Search for Project Catalyst proposals by topic, technology, or keywords. REQUIRED: Extract relevant keywords from the user\'s question to use as the search query.',
            'parameters' => [
                'type' => 'object',
                'properties' => [
                    'query' => [
                        'type' => 'string',
                        'description' => 'REQUIRED: Keywords extracted from user question. Examples: "AI" (for AI questions), "DeFi" (for DeFi), "education" (for education), "mobile app" (for mobile app questions). DO NOT leave empty.',
                    ],
                    'limit' => [
                        'type' => 'integer',
                        'description' => 'Maximum number of proposals to return (default: 5, max: 10)',
                        'default' => 5,
                        'minimum' => 1,
                        'maximum' => 10,
                    ],
                    'threshold' => [
                        'type' => 'number',
                        'description' => 'Similarity threshold (0.0 to 1.0). Higher values return more similar results (default: 0.7)',
                        'default' => 0.7,
                        'minimum' => 0.0,
                        'maximum' => 1.0,
                    ],
                    'fund_id' => [
                        'type' => 'string',
                        'description' => 'Optional: Limit search to proposals from a specific fund ID',
                    ],
                    'funded_only' => [
                        'type' => 'boolean',
                        'description' => 'Optional: Only return funded proposals (default: false)',
                        'default' => false,
                    ],
                ],
                'required' => ['query'],
            ],
        ];
    }

    public function execute(array $arguments, AgentContext $context, AgentMemory $memory): string
    {
        $query = trim($arguments['query'] ?? '');
        $limit = min($arguments['limit'] ?? 5, 10);
        $threshold = $arguments['threshold'] ?? 0.7;
        $fundId = $arguments['fund_id'] ?? null;
        $fundedOnly = $arguments['funded_only'] ?? false;

        // Validate query is not empty
        if (empty($query)) {
            return "Please provide a search query to find relevant proposals. For example, try searching for 'AI', 'DeFi', 'education', or 'mobile apps'.";
        }

        try {
            // Generate embedding for the search query
            $queryEmbedding = $this->embeddingService->generateEmbedding($query);

            // Search for similar proposal embeddings
            $similarEmbeddings = ModelEmbedding::where('embeddable_type', Proposal::class)
                ->forField('combined') // Search the combined field for best results
                ->similarTo($queryEmbedding, $limit * 2, $threshold) // Get extra results to filter
                ->with(['embeddable' => function ($query) use ($fundId, $fundedOnly) {
                    if ($fundId) {
                        $query->where('fund_id', $fundId);
                    }
                    if ($fundedOnly) {
                        $query->whereNotNull('funded_at');
                    }
                    $query->with(['fund', 'campaign']);
                }])
                ->get();

            // Filter and format results
            $proposals = $similarEmbeddings
                ->pluck('embeddable')
                ->filter() // Remove null embeddables (proposals that didn't match filters)
                ->take($limit)
                ->map(function (Proposal $proposal) use ($similarEmbeddings) {
                    // Find the similarity score for this proposal
                    $embedding = $similarEmbeddings->firstWhere('embeddable_id', $proposal->id);
                    $similarity = $embedding?->similarity ?? 0;

                    return [
                        'id' => $proposal->id,
                        'title' => $this->extractTitle($proposal),
                        'problem' => $this->extractField($proposal, 'problem'),
                        'solution' => $this->extractField($proposal, 'solution'),
                        'amount_requested' => $proposal->amount_requested,
                        'currency' => $proposal->currency,
                        'funded' => ! is_null($proposal->funded_at),
                        'fund' => $proposal->fund?->title ?? 'Unknown Fund',
                        'campaign' => $proposal->campaign?->title ?? 'General',
                        'similarity_score' => round($similarity, 3),
                        'url' => $proposal->link,
                    ];
                });

            if ($proposals->isEmpty()) {
                return "No proposals found matching your query. Try:\n".
                       "- Using different keywords\n".
                       "- Lowering the similarity threshold\n".
                       '- Broadening your search terms';
            }

            return $this->formatResults($proposals, $query);

        } catch (\Exception $e) {
            return 'Sorry, I encountered an error while searching proposals: '.$e->getMessage();
        }
    }

    private function extractTitle(Proposal $proposal): string
    {
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

    private function extractField(Proposal $proposal, string $field): ?string
    {
        $value = $proposal->getAttribute($field);

        if (is_array($value)) {
            $text = $value['en'] ?? array_values($value)[0] ?? '';
        } elseif (is_string($value)) {
            $decoded = json_decode($value, true);
            if (is_array($decoded)) {
                $text = $decoded['en'] ?? array_values($decoded)[0] ?? '';
            } else {
                $text = $value;
            }
        } else {
            $text = (string) $value;
        }

        // Truncate long text
        return strlen($text) > 200 ? substr($text, 0, 197).'...' : $text;
    }

    private function formatResults(Collection $proposals, string $query): string
    {
        $count = $proposals->count();
        $result = "Found {$count} proposal".($count > 1 ? 's' : '')." similar to: \"{$query}\"\n\n";

        foreach ($proposals as $index => $proposal) {
            $result .= ($index + 1).". **{$proposal['title']}**\n";
            $result .= "   💰 Requested: {$proposal['amount_requested']} {$proposal['currency']}\n";
            $result .= "   📊 Fund: {$proposal['fund']}\n";
            $result .= '   '.($proposal['funded'] ? '✅ FUNDED' : '⏳ Not Funded')."\n";
            $result .= '   🎯 Similarity: '.($proposal['similarity_score'] * 100)."%\n";

            if ($proposal['problem']) {
                $result .= "   🔍 Problem: {$proposal['problem']}\n";
            }

            if ($proposal['solution']) {
                $result .= "   💡 Solution: {$proposal['solution']}\n";
            }

            $result .= "   🔗 View: {$proposal['url']}\n\n";
        }

        $result .= '💡 **Tip**: Ask me specific questions about any of these proposals for more details!';

        return $result;
    }
}

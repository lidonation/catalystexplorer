<?php

declare(strict_types=1);

namespace App\Tools;

use App\Models\Fund;
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
            'description' => 'Search for Project Catalyst proposals by topic, technology, or keywords. You MUST extract relevant keywords from the user\'s question. For fund-specific searches like "show me funded proposals from fund 13", use query="funding" or "fund 13" and set fund_id="13" and funded_only=true.',
            'parameters' => [
                'type' => 'object',
                'properties' => [
                    'query' => [
                        'type' => 'string',
                        'description' => 'REQUIRED: Keywords extracted from user question. Examples: "AI", "DeFi", "education", "mobile app". For fund requests use "funding" or "fund X". NEVER leave empty - always provide a search term.',
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
                    'completed_only' => [
                        'type' => 'boolean',
                        'description' => 'Optional: Only return completed proposals (default: false)',
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
        $completedOnly = $arguments['completed_only'] ?? false;

        // Handle fund-specific queries by providing a default search term
        if (empty($query)) {
            if ($fundId) {
                $query = 'funding'; // Default query for fund-specific searches
            } else {
                return "Please provide a search query to find relevant proposals. For example, try searching for 'AI', 'DeFi', 'education', or 'mobile apps'.";
            }
        }

        try {
            // Generate embedding for the search query
            $queryEmbedding = $this->embeddingService->generateEmbedding($query);

            // Search for similar proposal embeddings
            $similarEmbeddings = ModelEmbedding::where('embeddable_type', Proposal::class)
                ->forField('combined') // Search the combined field for best results
                ->similarTo($queryEmbedding, $limit * 2, $threshold) // Get extra results to filter
                ->with(['embeddable' => function ($query) use ($fundId, $fundedOnly, $completedOnly) {
                    if ($fundId) {
                        $query->where('fund_id', $fundId);
                    }
                    if ($fundedOnly) {
                        $query->whereNotNull('funded_at');
                    }
                    if ($completedOnly) {
                        $query->where(function ($q) {
                            $q->where('status', 'complete')
                                ->orWhereHas('schedule', function ($sq) {
                                    $sq->where('status', 'completed');
                                });
                        });
                    }
                    $query->with(['fund', 'campaign', 'schedule']);
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
                        'completed' => $proposal->completed == 1,
                        'status' => $proposal->status,
                        'fund' => $proposal->fund?->title ?? 'Unknown Fund',
                        'campaign' => $proposal->campaign?->title ?? 'General',
                        'similarity_score' => round($similarity, 3),
                        'url' => $proposal->link,
                    ];
                });

            if ($proposals->isEmpty()) {
                // Fallback to database search when no embeddings are found
                return $this->fallbackDatabaseSearch($query, $fundId, $fundedOnly, $completedOnly, $limit);
            }

            return $this->formatResults($proposals, $query, false);

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

    /**
     * Fallback to database text search when no embeddings are available
     */
    private function fallbackDatabaseSearch(string $query, ?string $fundId, bool $fundedOnly, bool $completedOnly, int $limit): string
    {
        $proposalQuery = Proposal::query()
            ->with(['fund', 'campaign', 'schedule']);

        // Apply filters
        if ($fundId) {
            $proposalQuery->where('fund_id', $fundId);
        }

        if ($fundedOnly) {
            $proposalQuery->whereNotNull('funded_at');
        }

        if ($completedOnly) {
            $proposalQuery->where(function ($q) {
                $q->where('status', 'complete')
                    ->orWhereHas('schedule', function ($sq) {
                        $sq->where('status', 'completed');
                    });
            });
        }

        // Text search across relevant fields
        $proposalQuery->where(function ($q) use ($query) {
            $q->whereRaw('title::text ILIKE ?', ["%{$query}%"])
                ->orWhereRaw('problem::text ILIKE ?', ["%{$query}%"])
                ->orWhereRaw('solution::text ILIKE ?', ["%{$query}%"])
                ->orWhereRaw('content::text ILIKE ?', ["%{$query}%"]);
        });

        $proposals = $proposalQuery->limit($limit)->get();

        if ($proposals->isEmpty()) {
            $filterDescription = [];
            if ($fundId) {
                $fund = Fund::find($fundId);
                $filterDescription[] = strval('in '.$fund?->title ?? 'specified fund');
            }
            if ($fundedOnly) {
                $filterDescription[] = 'that are funded';
            }
            if ($completedOnly) {
                $filterDescription[] = 'that are completed';
            }

            $filterText = empty($filterDescription) ? '' : ' '.implode(' and ', $filterDescription);

            return "No proposals found matching '{$query}'{$filterText}. Try:\n".
                   "- Using different or broader keywords\n".
                   "- Removing filters to expand the search\n".
                   '- Checking if the fund has any proposals with matching content';
        }

        // Format results (similar to embedding results but without similarity score)
        $results = $proposals->map(function (Proposal $proposal) {
            return [
                'id' => $proposal->id,
                'title' => $this->extractTitle($proposal),
                'problem' => $this->extractField($proposal, 'problem'),
                'solution' => $this->extractField($proposal, 'solution'),
                'amount_requested' => $proposal->amount_requested,
                'currency' => $proposal->currency,
                'funded' => ! is_null($proposal->funded_at),
                'completed' => $proposal->completed == 1,
                'status' => $proposal->status,
                'fund' => $proposal->fund?->title ?? 'Unknown Fund',
                'campaign' => $proposal->campaign?->title ?? 'General',
                'similarity_score' => null, // No similarity score for database search
                'url' => $proposal->link,
            ];
        });

        return $this->formatResults($results, $query, true);
    }

    private function formatResults(Collection $proposals, string $query, bool $isDatabaseSearch = false): string
    {
        $count = $proposals->count();
        $searchType = $isDatabaseSearch ? 'database search' : 'semantic search';
        $result = "Found {$count} proposal".($count > 1 ? 's' : '')." matching: \"{$query}\" (via {$searchType})\n\n";

        foreach ($proposals as $index => $proposal) {
            $result .= ($index + 1).". **{$proposal['title']}**\n";
            $result .= "   💰 Requested: {$proposal['amount_requested']} {$proposal['currency']}\n";
            $result .= "   📊 Fund: {$proposal['fund']}\n";
            $result .= '   '.($proposal['funded'] ? '✅ FUNDED' : '⏳ Not Funded')."\n";
            $result .= '   '.($proposal['completed'] ? '🎉 COMPLETED' : '📝 Status: '.ucfirst($proposal['status']))."\n";

            // Only show similarity score for semantic search results
            if (! $isDatabaseSearch && isset($proposal['similarity_score'])) {
                $result .= '   🎯 Similarity: '.($proposal['similarity_score'] * 100)."%\n";
            }

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

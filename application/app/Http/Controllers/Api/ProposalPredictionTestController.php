<?php

declare(strict_types=1);

namespace App\Http\Controllers\Api;

use App\Enums\VoteEnum;
use App\Http\Controllers\Controller;
use App\Models\BookmarkCollection;
use App\Models\Proposal;
use App\Services\ProposalPredictionService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;

class ProposalPredictionTestController extends Controller
{
    public function __construct(
        private ProposalPredictionService $predictionService
    ) {}

    /**
     * Test AI predictions with sample data
     */
    public function testPredictions(Request $request): JsonResponse
    {
        try {
            // Get some sample proposals to simulate swipes
            $sampleProposals = Proposal::with(['fund', 'campaign', 'embeddings'])
                ->whereHas('embeddings', function ($query) {
                    $query->where('field_name', 'combined');
                })
                ->limit(10)
                ->get();

            if ($sampleProposals->count() < 5) {
                return response()->json([
                    'error' => 'Not enough proposals with embeddings for testing',
                    'available_proposals' => $sampleProposals->count(),
                    'required_minimum' => 5,
                ], 400);
            }

            // Create temporary bookmark collections for testing
            $testUser = $request->user();
            if (! $testUser) {
                return response()->json([
                    'error' => 'Authentication required for testing',
                    'message' => 'Please log in to test AI predictions',
                ], 401);
            }

            // Create test collections
            $rightCollection = BookmarkCollection::create([
                'user_id' => $testUser->id,
                'title' => 'AI Test - Liked Proposals',
                'content' => 'Test collection for AI predictions',
                'visibility' => 'private',
                'status' => 'draft',
            ]);

            $leftCollection = BookmarkCollection::create([
                'user_id' => $testUser->id,
                'title' => 'AI Test - Disliked Proposals',
                'content' => 'Test collection for AI predictions',
                'visibility' => 'private',
                'status' => 'draft',
            ]);

            // Add some proposals to simulate swipes
            $likedProposals = $sampleProposals->take(3);
            $dislikedProposals = $sampleProposals->skip(3)->take(2);

            // Add liked proposals to right collection
            foreach ($likedProposals as $proposal) {
                DB::table('bookmark_items')->insert([
                    'bookmark_collection_id' => $rightCollection->id,
                    'user_id' => $testUser->id,
                    'model_type' => Proposal::class,
                    'model_id' => $proposal->id,
                    'vote' => VoteEnum::YES->value,
                    'created_at' => now(),
                    'updated_at' => now(),
                ]);
            }

            // Add disliked proposals to left collection
            foreach ($dislikedProposals as $proposal) {
                DB::table('bookmark_items')->insert([
                    'bookmark_collection_id' => $leftCollection->id,
                    'user_id' => $testUser->id,
                    'model_type' => Proposal::class,
                    'model_id' => $proposal->id,
                    'vote' => VoteEnum::NO->value,
                    'created_at' => now(),
                    'updated_at' => now(),
                ]);
            }

            // Get AI recommendations
            $recommendations = $this->predictionService->getRecommendedProposals(
                $leftCollection,
                $rightCollection,
                $sampleProposals->pluck('id')->toArray(), // Exclude test proposals
                10
            );

            $result = response()->json([
                'success' => true,
                'test_data' => [
                    'liked_proposals' => $likedProposals->pluck('slug')->toArray(),
                    'disliked_proposals' => $dislikedProposals->pluck('slug')->toArray(),
                    'sample_proposal_count' => $sampleProposals->count(),
                    'left_collection_id' => $leftCollection->id,
                    'right_collection_id' => $rightCollection->id,
                ],
                'recommendations' => array_map(function ($rec) {
                    return [
                        'proposal_id' => $rec['proposal_id'],
                        'title' => $rec['proposal']->title ?? 'N/A',
                        'slug' => $rec['proposal']->slug ?? 'N/A',
                        'score' => round($rec['score'], 4),
                        'preference_similarity' => round($rec['preference_similarity'], 4),
                        'avoidance_similarity' => round($rec['avoidance_similarity'], 4),
                        'confidence' => round($rec['confidence'], 4),
                    ];
                }, $recommendations),
                'recommendations_count' => count($recommendations),
            ]);

            // Clean up test collections
            $leftCollection->delete();
            $rightCollection->delete();

            return $result;
        } catch (\Exception $e) {
            Log::error('AI prediction test failed', [
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString(),
            ]);

            return response()->json([
                'error' => 'Test failed: '.$e->getMessage(),
                'details' => 'Check logs for more information',
            ], 500);
        }
    }

    /**
     * Test search enhancement with AI
     */
    public function testSearchEnhancement(Request $request): JsonResponse
    {
        try {
            // Get sample search results
            $searchResults = Proposal::with(['fund', 'campaign'])
                ->whereHas('embeddings', function ($query) {
                    $query->where('field_name', 'combined');
                })
                ->limit(20)
                ->get()
                ->map(function ($proposal) {
                    return [
                        'id' => $proposal->id,
                        'title' => $proposal->title,
                        'slug' => $proposal->slug,
                        'ranking_total' => 75, // Simulate ranking
                        'amount_requested' => $proposal->amount_requested,
                    ];
                })
                ->toArray();

            if (empty($searchResults)) {
                return response()->json([
                    'error' => 'No proposals with embeddings found for testing',
                ], 400);
            }

            // Create temporary collections for testing
            $testUser = $request->user();
            if (! $testUser) {
                return response()->json([
                    'error' => 'Authentication required for testing',
                ], 401);
            }

            $rightCollection = BookmarkCollection::create([
                'user_id' => $testUser->id,
                'title' => 'Search Enhancement Test - Liked',
                'content' => 'Test collection',
                'visibility' => 'private',
                'status' => 'draft',
            ]);

            $leftCollection = BookmarkCollection::create([
                'user_id' => $testUser->id,
                'title' => 'Search Enhancement Test - Disliked',
                'content' => 'Test collection',
                'visibility' => 'private',
                'status' => 'draft',
            ]);

            // Add some test data
            $likedProposalIds = array_slice(array_column($searchResults, 'id'), 0, 3);
            $dislikedProposalIds = array_slice(array_column($searchResults, 'id'), 3, 2);

            foreach ($likedProposalIds as $proposalId) {
                DB::table('bookmark_items')->insert([
                    'bookmark_collection_id' => $rightCollection->id,
                    'user_id' => $testUser->id,
                    'model_type' => Proposal::class,
                    'model_id' => $proposalId,
                    'vote' => VoteEnum::YES->value,
                    'created_at' => now(),
                    'updated_at' => now(),
                ]);
            }

            foreach ($dislikedProposalIds as $proposalId) {
                DB::table('bookmark_items')->insert([
                    'bookmark_collection_id' => $leftCollection->id,
                    'user_id' => $testUser->id,
                    'model_type' => Proposal::class,
                    'model_id' => $proposalId,
                    'vote' => VoteEnum::NO->value,
                    'created_at' => now(),
                    'updated_at' => now(),
                ]);
            }

            // Test enhancement
            $enhancedResults = $this->predictionService->enhanceSearchResults(
                $searchResults,
                $leftCollection,
                $rightCollection
            );

            // Compare original vs enhanced
            $originalOrder = array_column($searchResults, 'title');
            $enhancedOrder = array_column($enhancedResults, 'title');

            $result = response()->json([
                'success' => true,
                'test_data' => [
                    'liked_proposals' => $likedProposalIds,
                    'disliked_proposals' => $dislikedProposalIds,
                    'original_count' => count($searchResults),
                ],
                'comparison' => [
                    'original_order' => array_slice($originalOrder, 0, 5),
                    'enhanced_order' => array_slice($enhancedOrder, 0, 5),
                    'order_changed' => $originalOrder !== $enhancedOrder,
                ],
                'enhanced_results' => array_slice(array_map(function ($result) {
                    return [
                        'title' => $result['title'] ?? 'N/A',
                        'original_ranking' => $result['ranking_total'] ?? 0,
                        'ai_score' => $result['ai_score'] ?? 0,
                        'final_score' => ($result['ai_score'] ?? 0) * 100 + ($result['ranking_total'] ?? 0),
                    ];
                }, $enhancedResults), 0, 10),
            ]);

            // Clean up test collections
            $leftCollection->delete();
            $rightCollection->delete();

            return $result;
        } catch (\Exception $e) {
            Log::error('Search enhancement test failed', [
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString(),
            ]);

            return response()->json([
                'error' => 'Test failed: '.$e->getMessage(),
            ], 500);
        }
    }

    /**
     * Get current session data for debugging (AI data now stored in BookmarkCollections)
     */
    public function getSessionData(Request $request): JsonResponse
    {
        return response()->json([
            'session_id' => session()->getId(),
            'session_data' => [
                'preferences' => session('tinder_proposal_preferences', []),
                'current_index' => session('tinder_proposal_current_index', 0),
                'total_seen' => session('tinder_proposal_total_seen', 0),
                'current_page' => session('tinder_proposal_current_page', null),
            ],
            'note' => 'AI swipe data is now stored in BookmarkCollections, not session',
            'proposal_counts' => [
                'with_embeddings' => Proposal::whereHas('embeddings', function ($query) {
                    $query->where('field_name', 'combined');
                })->count(),
                'total' => Proposal::count(),
            ],
        ]);
    }

    /**
     * Clear session data (AI data now stored in BookmarkCollections)
     */
    public function clearSessionData(Request $request): JsonResponse
    {
        session()->forget([
            'tinder_proposal_preferences',
            'tinder_proposal_current_index',
            'tinder_proposal_total_seen',
            'tinder_proposal_current_page',
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Session data cleared (AI data is now in BookmarkCollections)',
        ]);
    }

    /**
     * Check embeddings coverage
     */
    public function checkEmbeddingsCoverage(Request $request): JsonResponse
    {
        $totalProposals = Proposal::count();
        $proposalsWithEmbeddings = Proposal::whereHas('embeddings', function ($query) {
            $query->where('field_name', 'combined');
        })->count();

        $coveragePercentage = $totalProposals > 0 ? ($proposalsWithEmbeddings / $totalProposals) * 100 : 0;

        // Get some examples
        $recentProposalsWithEmbeddings = Proposal::whereHas('embeddings', function ($query) {
            $query->where('field_name', 'combined');
        })
            ->with('embeddings')
            ->latest()
            ->take(5)
            ->get()
            ->map(function ($proposal) {
                $embedding = $proposal->embeddings->where('field_name', 'combined')->first();

                return [
                    'id' => $proposal->id,
                    'title' => $proposal->title,
                    'slug' => $proposal->slug,
                    'embedding_dimensions' => $embedding ? $embedding->dimensions : null,
                    'embedding_created' => $embedding ? $embedding->created_at : null,
                ];
            });

        return response()->json([
            'coverage' => [
                'total_proposals' => $totalProposals,
                'proposals_with_embeddings' => $proposalsWithEmbeddings,
                'coverage_percentage' => round($coveragePercentage, 2),
                'status' => $coveragePercentage > 50 ? 'good' : ($coveragePercentage > 10 ? 'moderate' : 'poor'),
            ],
            'recent_examples' => $recentProposalsWithEmbeddings,
            'recommendations' => $coveragePercentage < 50 ? [
                'Consider running embedding generation for more proposals',
                'AI recommendations work best with 50%+ embedding coverage',
            ] : [
                'Good embedding coverage for AI recommendations',
            ],
        ]);
    }
}

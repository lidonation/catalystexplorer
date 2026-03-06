<?php

declare(strict_types=1);

namespace App\Tools;

use App\Actions\Ai\ExtractProposalField;
use App\Actions\Ai\ExtractProposalTitle;
use App\Models\Proposal;
use Illuminate\Support\Facades\Cache;
use Prism\Prism\Facades\Prism;
use Prism\Prism\ValueObjects\Messages\UserMessage;
use Vizra\VizraADK\Contracts\ToolInterface;
use Vizra\VizraADK\Memory\AgentMemory;
use Vizra\VizraADK\System\AgentContext;

class ProposalComparisonTool implements ToolInterface
{
    private const CACHE_TTL = 60 * 60 * 24 * 30;

    private const CACHE_PREFIX = 'proposal_ai_analysis:';

    public function definition(): array
    {
        return [
            'name' => 'generate_proposal_comparison',
            'description' => 'Generate structured JSON comparison data for multiple Project Catalyst proposals based on the Fund 14 scoring rubric. This tool evaluates proposals on Alignment (30pts), Feasibility (35pts), and Auditability (35pts).',
            'parameters' => [
                'type' => 'object',
                'properties' => [
                    'proposal_ids' => [
                        'type' => 'array',
                        'items' => [
                            'type' => 'string',
                        ],
                        'description' => 'Array of proposal IDs to compare and analyze',
                    ],
                ],
                'required' => ['proposal_ids'],
            ],
        ];
    }

    public function execute(array $arguments, ?AgentContext $context = null, ?AgentMemory $memory = null): string
    {
        \Log::info('ProposalComparisonTool executed', [
            'arguments' => $arguments,
            'context_agent' => $context?->getAgent()?->getName() ?? 'direct_call',
        ]);

        $proposalIds = $arguments['proposal_ids'] ?? [];

        if (empty($proposalIds)) {
            return json_encode([
                'error' => 'No proposal IDs provided for comparison',
            ]);
        }

        try {
            $proposals = Proposal::with(['fund', 'campaign', 'team.model'])
                ->whereIn('id', $proposalIds)
                ->get();

            if ($proposals->isEmpty()) {
                return json_encode([
                    'error' => 'No proposals found with the provided IDs',
                ]);
            }

            $comparisons = [];

            foreach ($proposals as $proposal) {
                $cacheKey = self::CACHE_PREFIX.$proposal->id;

                $analysis = Cache::remember($cacheKey, self::CACHE_TTL, function () use ($proposal) {
                    return $this->analyzeProposal($proposal);
                });

                $comparisons[] = $analysis;
            }

            return json_encode([
                'success' => true,
                'comparisons' => $comparisons,
                'generated_at' => now()->toISOString(),
                'rubric_version' => 'Fund 14',
            ]);

        } catch (\Exception $e) {
            \Log::error('ProposalComparisonTool error', [
                'proposal_ids' => $proposalIds,
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString(),
            ]);

            return json_encode([
                'success' => false,
                'error' => 'Failed to generate comparison: '.$e->getMessage(),
                'details' => [
                    'proposal_ids' => $proposalIds,
                    'error_class' => get_class($e),
                ],
            ]);
        }
    }

    private function analyzeProposal(Proposal $proposal): array
    {
        $extractTitle = new ExtractProposalTitle;
        $extractField = new ExtractProposalField;

        $title = $extractTitle($proposal);
        $problem = $extractField($proposal, 'problem') ?? '';
        $solution = $extractField($proposal, 'solution') ?? '';
        $experience = $extractField($proposal, 'experience') ?? '';
        $content = $extractField($proposal, 'content') ?? '';

        // Get AI-powered analysis including scores
        $aiAnalysis = $this->generateAiAnalysis($proposal, $title, $problem, $solution, $experience, $content);

        $alignmentScore = $aiAnalysis['alignment_score'] ?? $this->scoreAlignment($problem.' '.$solution, $proposal);
        $feasibilityScore = $aiAnalysis['feasibility_score'] ?? $this->scoreFeasibility($experience.' '.$solution, $proposal);
        $auditabilityScore = $aiAnalysis['auditability_score'] ?? $this->scoreAuditability($content, $proposal);

        $totalScore = $alignmentScore + $feasibilityScore + $auditabilityScore;

        return [
            'proposal_id' => $proposal->id,
            'title' => $title,
            'summary' => $aiAnalysis['summary'] ?? $this->generateSummary($proposal, $problem, $solution),
            'one_sentence_summary' => $aiAnalysis['one_sentence_summary'] ?? $this->generateOneSentenceSummary($proposal, $totalScore),
            'alignment_score' => $alignmentScore,
            'feasibility_score' => $feasibilityScore,
            'auditability_score' => $auditabilityScore,
            'total_score' => $totalScore,
            'recommendation' => $aiAnalysis['recommendation'] ?? ($totalScore >= 70 ? 'Fund' : "Don't Fund"),
            'strengths' => $aiAnalysis['strengths'] ?? [],
            'improvements' => $aiAnalysis['improvements'] ?? [],
            'pros' => $aiAnalysis['pros'] ?? [],
            'cons' => $aiAnalysis['cons'] ?? [],
            'detailed_analysis' => [
                'alignment_breakdown' => $this->getAlignmentBreakdown($proposal),
                'feasibility_breakdown' => $this->getFeasibilityBreakdown($proposal),
                'auditability_breakdown' => $this->getAuditabilityBreakdown($proposal),
            ],
        ];
    }

    private function scoreAlignment(string $content, Proposal $proposal): int
    {
        $score = 0;

        // Impact potential (10 points)
        $impactKeywords = ['scale', 'ecosystem', 'community', 'adoption', 'innovation', 'growth'];
        $impactScore = $this->scoreByKeywords($content, $impactKeywords, 10);

        // Problem understanding (10 points)
        $problemScore = min(10, max(0, strlen($content) > 100 ? 8 : 4));
        if (str_contains(strtolower($content), 'currently') || str_contains(strtolower($content), 'challenge')) {
            $problemScore += 2;
        }

        // Solution fit (10 points)
        $solutionScore = min(10, max(0, strlen($content) > 200 ? 8 : 4));
        if (str_contains(strtolower($content), 'will') && str_contains(strtolower($content), 'by')) {
            $solutionScore += 2;
        }

        return min(30, $impactScore + $problemScore + $solutionScore);
    }

    private function scoreFeasibility(string $content, Proposal $proposal): int
    {
        // Team capability (10 points)
        $teamScore = strlen($content) > 50 ? 7 : 3;
        if ($proposal->team && $proposal->team->count() > 0) {
            $teamScore += 3;
        }

        // Technical approach (10 points)
        $techKeywords = ['technology', 'framework', 'development', 'implementation', 'architecture'];
        $techScore = $this->scoreByKeywords($content, $techKeywords, 10);

        // Resource planning (10 points)
        $resourceScore = 5; // Base score
        if ($proposal->amount_requested > 0 && $proposal->amount_requested <= 75000) {
            $resourceScore += 3; // Reasonable budget
        }
        if ($proposal->project_length && $proposal->project_length <= 12) {
            $resourceScore += 2; // Realistic timeline
        }

        // Risk management (5 points)
        $riskScore = str_contains(strtolower($content), 'risk') ? 4 : 2;

        return min(35, $teamScore + $techScore + $resourceScore + $riskScore);
    }

    private function scoreAuditability(string $content, Proposal $proposal): int
    {
        // Success metrics (10 points)
        $metricsKeywords = ['metric', 'measure', 'kpi', 'target', 'goal', 'success'];
        $metricsScore = $this->scoreByKeywords($content, $metricsKeywords, 10);

        // Progress tracking (10 points)
        $trackingKeywords = ['milestone', 'deliverable', 'progress', 'report', 'update'];
        $trackingScore = $this->scoreByKeywords($content, $trackingKeywords, 10);

        // Milestone definition (10 points)
        $milestoneScore = 5; // Base score
        if (str_contains(strtolower($content), 'month') || str_contains(strtolower($content), 'week')) {
            $milestoneScore += 3;
        }
        if (str_contains(strtolower($content), 'deliverable')) {
            $milestoneScore += 2;
        }

        // Accountability framework (5 points)
        $accountabilityScore = $proposal->opensource ? 3 : 1;
        $accountabilityScore += str_contains(strtolower($content), 'transparent') ? 2 : 0;

        return min(35, $metricsScore + $trackingScore + $milestoneScore + $accountabilityScore);
    }

    private function scoreByKeywords(string $text, array $keywords, int $maxScore): int
    {
        $text = strtolower($text);
        $matches = 0;

        foreach ($keywords as $keyword) {
            if (str_contains($text, strtolower($keyword))) {
                $matches++;
            }
        }

        $percentage = $matches / count($keywords);
        $score = $percentage * $maxScore;
        $finalScore = max(1, min($maxScore, $score));

        return intval($finalScore);
    }

    private function generateAiAnalysis(Proposal $proposal, string $title, string $problem, string $solution, string $experience, string $content): array
    {
        try {
            $prompt = $this->buildAnalysisPrompt($proposal, $title, $problem, $solution, $experience, $content);

            $systemMessage = 'You are an expert Project Catalyst reviewer. Analyze the provided proposal data and return a JSON response with the requested insights. Be specific, insightful, and base your analysis on the actual proposal content.';

            // Use Prism to make the LLM call
            $provider = config('vizra-adk.default_provider', 'openai');
            $model = config('vizra-adk.default_model', 'gpt-4o-mini');

            $messages = [
                new UserMessage($prompt),
            ];

            $response = Prism::text()
                ->using($provider, $model)
                ->withSystemPrompt($systemMessage)
                ->usingTemperature(0.7)
                ->withMaxTokens(2000)
                ->withMessages($messages)
                ->asText();

            $responseContent = $response->text;

            // Try to extract JSON from the response
            if (preg_match('/\{[^{}]*(?:\{[^{}]*\}[^{}]*)*\}/', $responseContent, $matches)) {
                $jsonData = json_decode($matches[0], true);
                if ($jsonData && is_array($jsonData) &&
                    isset($jsonData['alignment_score']) &&
                    isset($jsonData['feasibility_score']) &&
                    isset($jsonData['auditability_score'])) {
                    return $jsonData;
                }
            }

            \Log::warning('Failed to parse AI analysis JSON', [
                'response_content' => $responseContent,
                'proposal_id' => $proposal->id,
            ]);

            return $this->getFallbackAnalysis($proposal);

        } catch (\Exception $e) {
            \Log::error('AI insights generation failed', [
                'proposal_id' => $proposal->id,
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString(),
            ]);

            return $this->getFallbackAnalysis($proposal);
        }
    }

    private function buildAnalysisPrompt(Proposal $proposal, string $title, string $problem, string $solution, string $experience, string $content): string
    {
        $fundingStatus = $proposal->funded_at ? 'funded' : 'unfunded';
        $amount = number_format($proposal->amount_requested);
        $openSource = $proposal->opensource ? 'Yes' : 'No';

        // Load the prompt template from file
        $promptPath = resource_path('prompts/catalyst-proposal-analysis.md');
        if (! file_exists($promptPath)) {
            throw new \Exception("Prompt template not found at: {$promptPath}");
        }

        $promptTemplate = file_get_contents($promptPath);

        // Replace placeholders with actual values
        $replacements = [
            '{title}' => $title,
            '{amount}' => $amount,
            '{currency}' => $proposal->currency,
            '{funding_status}' => $fundingStatus,
            '{project_length}' => $proposal->project_length,
            '{open_source}' => $openSource,
            '{problem}' => $problem,
            '{solution}' => $solution,
            '{experience}' => $experience,
            '{content}' => $content,
        ];

        return str_replace(array_keys($replacements), array_values($replacements), $promptTemplate);
    }

    /**
     * Generate rule-based scores and analysis when AI fails
     */
    private function getFallbackAnalysis(Proposal $proposal): array
    {
        $extractField = new ExtractProposalField;

        $problem = $extractField($proposal, 'problem') ?? '';
        $solution = $extractField($proposal, 'solution') ?? '';
        $experience = $extractField($proposal, 'relevant_experience') ?? '';
        $content = $problem.' '.$solution.' '.$experience;

        $alignmentScore = $this->scoreAlignment($content, $proposal);
        $feasibilityScore = $this->scoreFeasibility($content, $proposal);
        $auditabilityScore = $this->scoreAuditability($content, $proposal);
        $totalScore = $alignmentScore + $feasibilityScore + $auditabilityScore;

        $strengths = [];
        $improvements = [];
        $pros = [];
        $cons = [];

        // Analyze based on scores
        if ($alignmentScore >= 24) {
            $strengths[] = 'Strong alignment with Catalyst objectives and clear problem identification';
            $pros[] = 'Well-aligned solution addressing important ecosystem challenges';
        }

        if ($feasibilityScore >= 28) {
            $strengths[] = 'Feasible approach with realistic resource planning and capable team';
            $pros[] = 'Realistic implementation plan with achievable milestones';
        }

        if ($auditabilityScore >= 28) {
            $strengths[] = 'Clear success metrics and accountability framework';
            $pros[] = 'Transparent progress tracking and measurable outcomes';
        }

        // Analyze based on proposal attributes
        if ($proposal->amount_requested <= 50000) {
            $strengths[] = 'Conservative budget allocation reducing financial risk';
        } elseif ($proposal->amount_requested > 100000) {
            $cons[] = 'High budget request requires strong justification';
            $improvements[] = 'Consider breaking down large budget into phases';
        }

        if ($proposal->opensource) {
            $pros[] = 'Open-source approach maximizes community benefit';
        } else {
            $cons[] = 'Closed-source approach limits community value';
            $improvements[] = 'Consider open-source strategy for greater transparency';
        }

        if ($alignmentScore < 20) {
            $improvements[] = 'Strengthen alignment with Catalyst objectives';
            $cons[] = 'Limited alignment with ecosystem priorities';
        }

        if ($feasibilityScore < 25) {
            $improvements[] = 'Provide more technical implementation details';
            $cons[] = 'Execution feasibility concerns need addressing';
        }

        if ($auditabilityScore < 25) {
            $improvements[] = 'Define clearer success metrics and reporting mechanisms';
            $cons[] = 'Insufficient accountability and progress tracking';
        }

        return [
            'alignment_score' => $alignmentScore,
            'feasibility_score' => $feasibilityScore,
            'auditability_score' => $auditabilityScore,
            'recommendation' => $totalScore >= 70 ? 'Fund' : "Don't Fund",
            'strengths' => array_slice($strengths, 0, 5),
            'improvements' => array_slice($improvements, 0, 5),
            'pros' => array_slice($pros, 0, 3),
            'cons' => array_slice($cons, 0, 3),
            'summary' => $this->generateSummary($proposal, $problem, $solution),
            'one_sentence_summary' => $this->generateOneSentenceSummary($proposal, $totalScore),
        ];
    }

    private function generateSummary(Proposal $proposal, string $problem, string $solution): string
    {
        $extractTitle = new ExtractProposalTitle;

        $title = $extractTitle($proposal);
        $fundingStatus = $proposal->funded_at ? 'funded' : 'unfunded';
        $amount = number_format($proposal->amount_requested);

        return "This {$fundingStatus} proposal '{$title}' requests {$amount} {$proposal->currency} to address challenges in the Catalyst ecosystem. ".
               'The project demonstrates '.(strlen($problem) > 100 ? 'strong' : 'basic').' problem understanding and '.
               (strlen($solution) > 150 ? 'detailed' : 'general').' solution planning.';
    }

    private function generateOneSentenceSummary(Proposal $proposal, int $totalScore): string
    {
        $quality = $totalScore >= 80 ? 'exceptional' : ($totalScore >= 70 ? 'strong' : ($totalScore >= 50 ? 'adequate' : 'limited'));
        $recommendation = $totalScore >= 70 ? 'recommended for funding' : 'needs improvement before funding';

        return "This proposal shows {$quality} merit across the evaluation criteria and is {$recommendation}.";
    }

    private function getAlignmentBreakdown(Proposal $proposal): array
    {
        return [
            'impact_potential' => 'Evaluated based on ecosystem benefit and innovation potential',
            'problem_understanding' => 'Assessed through problem statement depth and clarity',
            'solution_fit' => 'Analyzed for appropriateness and effectiveness of proposed approach',
        ];
    }

    private function getFeasibilityBreakdown(Proposal $proposal): array
    {
        return [
            'team_capability' => 'Reviewed team experience and track record',
            'technical_approach' => 'Assessed technical soundness and implementation strategy',
            'resource_planning' => 'Evaluated budget, timeline, and resource allocation',
            'risk_management' => 'Analyzed risk identification and mitigation strategies',
        ];
    }

    private function getAuditabilityBreakdown(Proposal $proposal): array
    {
        return [
            'success_metrics' => 'Reviewed measurable success criteria and KPIs',
            'progress_tracking' => 'Assessed reporting and monitoring mechanisms',
            'milestone_definition' => 'Evaluated specificity and measurability of milestones',
            'accountability_framework' => 'Analyzed transparency and accountability measures',
        ];
    }
}

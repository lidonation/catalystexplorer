<?php

declare(strict_types=1);

namespace App\Tools;

use App\Models\Proposal;
use Vizra\VizraADK\Contracts\ToolInterface;
use Vizra\VizraADK\Memory\AgentMemory;
use Vizra\VizraADK\System\AgentContext;

class ProposalComparisonTool implements ToolInterface
{
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
                            'type' => 'string'
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
                'error' => 'No proposal IDs provided for comparison'
            ]);
        }

        try {
            $proposals = Proposal::with(['fund', 'campaign', 'team.model'])
                ->whereIn('id', $proposalIds)
                ->get();

            if ($proposals->isEmpty()) {
                return json_encode([
                    'error' => 'No proposals found with the provided IDs'
                ]);
            }

            $comparisons = [];

            foreach ($proposals as $proposal) {
                $analysis = $this->analyzeProposal($proposal);
                $comparisons[] = $analysis;
            }

            return json_encode([
                'success' => true,
                'comparisons' => $comparisons,
                'generated_at' => now()->toISOString(),
                'rubric_version' => 'Fund 14'
            ]);

        } catch (\Exception $e) {
            \Log::error('ProposalComparisonTool error', [
                'proposal_ids' => $proposalIds,
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString()
            ]);
            
            return json_encode([
                'success' => false,
                'error' => 'Failed to generate comparison: ' . $e->getMessage(),
                'details' => [
                    'proposal_ids' => $proposalIds,
                    'error_class' => get_class($e)
                ]
            ]);
        }
    }

    private function analyzeProposal(Proposal $proposal): array
    {
        $title = $this->extractTitle($proposal);
        $problem = $this->extractField($proposal, 'problem') ?? '';
        $solution = $this->extractField($proposal, 'solution') ?? '';
        $experience = $this->extractField($proposal, 'experience') ?? '';
        $content = $this->extractField($proposal, 'content') ?? '';

        // Analyze alignment (30 points)
        $alignmentScore = $this->scoreAlignment($title, $problem, $solution, $proposal);
        
        // Analyze feasibility (35 points)
        $feasibilityScore = $this->scoreFeasibility($experience, $proposal, $solution);
        
        // Analyze auditability (35 points)
        $auditabilityScore = $this->scoreAuditability($content, $proposal);

        $totalScore = $alignmentScore + $feasibilityScore + $auditabilityScore;

        // Generate insights
        $strengths = $this->identifyStrengths($proposal, $alignmentScore, $feasibilityScore, $auditabilityScore);
        $improvements = $this->identifyImprovements($proposal, $alignmentScore, $feasibilityScore, $auditabilityScore);
        $pros = $this->generatePros($proposal, $problem, $solution);
        $cons = $this->generateCons($proposal, $problem, $solution, $experience);
        
        return [
            'proposal_id' => $proposal->id,
            'title' => $title,
            'summary' => $this->generateSummary($proposal, $problem, $solution),
            'one_sentence_summary' => $this->generateOneSentenceSummary($proposal, $totalScore),
            'alignment_score' => $alignmentScore,
            'feasibility_score' => $feasibilityScore,
            'auditability_score' => $auditabilityScore,
            'total_score' => $totalScore,
            'recommendation' => $totalScore >= 70 ? 'Fund' : "Don't Fund",
            'strengths' => $strengths,
            'improvements' => $improvements,
            'pros' => $pros,
            'cons' => $cons,
            'detailed_analysis' => [
                'alignment_breakdown' => $this->getAlignmentBreakdown($proposal),
                'feasibility_breakdown' => $this->getFeasibilityBreakdown($proposal),
                'auditability_breakdown' => $this->getAuditabilityBreakdown($proposal),
            ]
        ];
    }

    private function scoreAlignment(string $title, string $problem, string $solution, Proposal $proposal): int
    {
        $score = 0;
        
        // Impact potential (10 points)
        $impactKeywords = ['scale', 'ecosystem', 'community', 'adoption', 'innovation', 'growth'];
        $impactScore = $this->scoreByKeywords($problem . ' ' . $solution, $impactKeywords, 10);
        
        // Problem understanding (10 points)
        $problemScore = min(10, max(0, strlen($problem) > 100 ? 8 : 4));
        if (str_contains(strtolower($problem), 'currently') || str_contains(strtolower($problem), 'challenge')) {
            $problemScore += 2;
        }
        
        // Solution fit (10 points)
        $solutionScore = min(10, max(0, strlen($solution) > 100 ? 8 : 4));
        if (str_contains(strtolower($solution), 'will') && str_contains(strtolower($solution), 'by')) {
            $solutionScore += 2;
        }
        
        return min(30, $impactScore + $problemScore + $solutionScore);
    }

    private function scoreFeasibility(string $experience, Proposal $proposal, string $solution): int
    {
        $score = 0;
        
        // Team capability (10 points)
        $teamScore = strlen($experience) > 50 ? 7 : 3;
        if ($proposal->team && $proposal->team->count() > 0) {
            $teamScore += 3;
        }
        
        // Technical approach (10 points)
        $techKeywords = ['technology', 'framework', 'development', 'implementation', 'architecture'];
        $techScore = $this->scoreByKeywords($solution, $techKeywords, 10);
        
        // Resource planning (10 points)
        $resourceScore = 5; // Base score
        if ($proposal->amount_requested > 0 && $proposal->amount_requested <= 75000) {
            $resourceScore += 3; // Reasonable budget
        }
        if ($proposal->project_length && $proposal->project_length <= 12) {
            $resourceScore += 2; // Realistic timeline
        }
        
        // Risk management (5 points)
        $riskScore = str_contains(strtolower($solution . ' ' . $experience), 'risk') ? 4 : 2;
        
        return min(35, $teamScore + $techScore + $resourceScore + $riskScore);
    }

    private function scoreAuditability(string $content, Proposal $proposal): int
    {
        $score = 0;
        
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

    private function identifyStrengths(Proposal $proposal, int $alignment, int $feasibility, int $auditability): array
    {
        $strengths = [];
        
        if ($alignment >= 24) {
            $strengths[] = 'Strong alignment with Catalyst objectives and clear problem identification';
        }
        
        if ($feasibility >= 28) {
            $strengths[] = 'Feasible approach with realistic resource planning and capable team';
        }
        
        if ($auditability >= 28) {
            $strengths[] = 'Clear success metrics and accountability framework';
        }
        
        if ($proposal->amount_requested <= 50000) {
            $strengths[] = 'Conservative budget allocation reducing financial risk';
        }
        
        if ($proposal->team && $proposal->team->count() > 2) {
            $strengths[] = 'Well-structured team with diverse expertise';
        }
        
        return array_slice($strengths, 0, 5);
    }

    private function identifyImprovements(Proposal $proposal, int $alignment, int $feasibility, int $auditability): array
    {
        $improvements = [];
        
        if ($alignment < 20) {
            $improvements[] = 'Strengthen alignment by better articulating problem impact and solution relevance';
        }
        
        if ($feasibility < 25) {
            $improvements[] = 'Provide more details on technical approach and team capabilities';
        }
        
        if ($auditability < 25) {
            $improvements[] = 'Define clearer success metrics and milestone tracking mechanisms';
        }
        
        if ($proposal->amount_requested > 75000) {
            $improvements[] = 'Consider breaking down large budget into smaller, more manageable phases';
        }
        
        if (!$proposal->opensource) {
            $improvements[] = 'Consider open-source approach to increase transparency and community value';
        }
        
        return array_slice($improvements, 0, 5);
    }

    private function generatePros(Proposal $proposal, string $problem, string $solution): array
    {
        $pros = [];
        
        if (strlen($problem) > 150) {
            $pros[] = 'Comprehensive problem analysis demonstrating deep understanding';
        }
        
        if (strlen($solution) > 200) {
            $pros[] = 'Detailed solution approach with clear implementation strategy';
        }
        
        if ($proposal->amount_requested <= 50000) {
            $pros[] = 'Cost-effective budget that maximizes value for the ecosystem';
        }
        
        if ($proposal->project_length && $proposal->project_length <= 6) {
            $pros[] = 'Short timeline allowing for quick delivery and iteration';
        }
        
        if ($proposal->team && $proposal->team->count() > 0) {
            $pros[] = 'Dedicated team committed to project execution';
        }
        
        return array_slice($pros, 0, 3);
    }

    private function generateCons(Proposal $proposal, string $problem, string $solution, string $experience): array
    {
        $cons = [];
        
        if (strlen($problem) < 100) {
            $cons[] = 'Limited problem description may indicate superficial understanding';
        }
        
        if (strlen($experience) < 50) {
            $cons[] = 'Insufficient team experience details raise capability concerns';
        }
        
        if ($proposal->amount_requested > 100000) {
            $cons[] = 'High budget request requires strong justification and risk management';
        }
        
        if (!$proposal->opensource) {
            $cons[] = 'Closed-source approach limits community benefit and transparency';
        }
        
        if ($proposal->project_length && $proposal->project_length > 12) {
            $cons[] = 'Extended timeline increases execution risk and market uncertainty';
        }
        
        return array_slice($cons, 0, 3);
    }

    private function generateSummary(Proposal $proposal, string $problem, string $solution): string
    {
        $title = $this->extractTitle($proposal);
        $fundingStatus = $proposal->funded_at ? 'funded' : 'unfunded';
        $amount = number_format($proposal->amount_requested);
        
        return "This {$fundingStatus} proposal '{$title}' requests {$amount} {$proposal->currency} to address challenges in the Catalyst ecosystem. " .
               "The project demonstrates " . (strlen($problem) > 100 ? "strong" : "basic") . " problem understanding and " .
               (strlen($solution) > 150 ? "detailed" : "general") . " solution planning.";
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
            'solution_fit' => 'Analyzed for appropriateness and effectiveness of proposed approach'
        ];
    }

    private function getFeasibilityBreakdown(Proposal $proposal): array
    {
        return [
            'team_capability' => 'Reviewed team experience and track record',
            'technical_approach' => 'Assessed technical soundness and implementation strategy',
            'resource_planning' => 'Evaluated budget, timeline, and resource allocation',
            'risk_management' => 'Analyzed risk identification and mitigation strategies'
        ];
    }

    private function getAuditabilityBreakdown(Proposal $proposal): array
    {
        return [
            'success_metrics' => 'Reviewed measurable success criteria and KPIs',
            'progress_tracking' => 'Assessed reporting and monitoring mechanisms',
            'milestone_definition' => 'Evaluated specificity and measurability of milestones',
            'accountability_framework' => 'Analyzed transparency and accountability measures'
        ];
    }

    private function extractTitle(Proposal $proposal): string
    {
        $title = $proposal->title;

        if (is_array($title)) {
            return $title['en'] ?? array_values($title)[0] ?? 'Untitled Proposal';
        }

        if (is_string($title)) {
            $decoded = json_decode($title, true);
            if (is_array($decoded)) {
                return $decoded['en'] ?? array_values($decoded)[0] ?? 'Untitled Proposal';
            }

            return $title;
        }

        return 'Untitled Proposal';
    }

    private function extractField(Proposal $proposal, string $field): ?string
    {
        $value = $proposal->getAttribute($field);

        if (empty($value)) {
            return null;
        }

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

        return trim($text) ?: null;
    }
}
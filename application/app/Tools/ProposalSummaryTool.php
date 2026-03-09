<?php

declare(strict_types=1);

namespace App\Tools;

use App\Actions\Ai\ExtractProposalField;
use App\Actions\Ai\ExtractProposalTitle;
use App\Models\Proposal;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Log;
use Prism\Prism\Facades\Prism;
use Prism\Prism\ValueObjects\Messages\UserMessage;
use Vizra\VizraADK\Contracts\ToolInterface;
use Vizra\VizraADK\Memory\AgentMemory;
use Vizra\VizraADK\System\AgentContext;

class ProposalSummaryTool implements ToolInterface
{
    private const CACHE_TTL = 60 * 60 * 24 * 30;

    private const CACHE_PREFIX = 'proposal_ai_summary:';

    public function definition(): array
    {
        return [
            'name' => 'generate_proposal_summary',
            'description' => 'Generate a concise AI-powered summary for a single Project Catalyst proposal, including key highlights, strengths, and recommendations.',
            'parameters' => [
                'type' => 'object',
                'properties' => [
                    'proposal_id' => [
                        'type' => 'string',
                        'description' => 'The ID of the proposal to summarize',
                    ],
                ],
                'required' => ['proposal_id'],
            ],
        ];
    }

    public function execute(array $arguments, ?AgentContext $context = null, ?AgentMemory $memory = null): string
    {
        $proposalId = $arguments['proposal_id'] ?? null;

        if (empty($proposalId)) {
            return json_encode([
                'success' => false,
                'error' => 'No proposal ID provided for summary',
            ]);
        }

        try {
            $proposal = Proposal::with(['fund', 'campaign', 'team.model'])
                ->find($proposalId);

            if (! $proposal) {
                return json_encode([
                    'success' => false,
                    'error' => 'Proposal not found with the provided ID',
                ]);
            }

            $cacheKey = self::CACHE_PREFIX.$proposal->id;

            $summary = Cache::remember($cacheKey, self::CACHE_TTL, function () use ($proposal) {
                return $this->summarizeProposal($proposal);
            });

            $proposal->update([
                'ai_summary' => json_encode($summary),
                'ai_generated_at' => now(),
            ]);

            return json_encode([
                'success' => true,
                'summary' => $summary,
                'generated_at' => now()->toISOString(),
            ]);
        } catch (\Exception $e) {
            Log::error('ProposalSummaryTool error', [
                'proposal_id' => $proposalId,
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString(),
            ]);

            return json_encode([
                'success' => false,
                'error' => 'Failed to generate summary: '.$e->getMessage(),
                'details' => [
                    'proposal_id' => $proposalId,
                    'error_class' => get_class($e),
                ],
            ]);
        }
    }

    private function summarizeProposal(Proposal $proposal): array
    {
        $extractTitle = new ExtractProposalTitle;
        $extractField = new ExtractProposalField;

        $title = $extractTitle($proposal);
        $problem = $extractField($proposal, 'problem') ?? '';
        $solution = $extractField($proposal, 'solution') ?? '';
        $experience = $extractField($proposal, 'experience') ?? '';
        $content = $extractField($proposal, 'content') ?? '';

        $aiSummary = $this->generateAiSummary($proposal, $title, $problem, $solution, $experience, $content);

        return [
            'proposal_id' => $proposal->id,
            'title' => $title,
            'summary' => $aiSummary['summary'] ?? null,
            'one_sentence_summary' => $aiSummary['one_sentence_summary'] ?? null,
            'key_points' => $aiSummary['key_points'] ?? [],
            'strengths' => $aiSummary['strengths'] ?? [],
            'considerations' => $aiSummary['considerations'] ?? [],
        ];
    }

    private function generateAiSummary(Proposal $proposal, string $title, string $problem, string $solution, string $experience, string $content): array
    {
        try {
            $prompt = $this->buildSummaryPrompt($proposal, $title, $problem, $solution, $experience, $content);

            $systemMessage = 'You are an expert Project Catalyst proposal analyzer. Analyze proposals in detail and provide UNIQUE, specific insights based on their actual content. Return ONLY valid JSON with these exact fields: summary, one_sentence_summary, key_points (array), strengths (array), considerations (array).';

            $provider = config('vizra-adk.default_provider', 'openai');
            $model = config('vizra-adk.default_model', 'gpt-4o-mini');

            Log::info('AI Summary - LLM Call', [
                'proposal_id' => $proposal->id,
                'provider' => $provider,
                'model' => $model,
                'title' => $title,
            ]);

            $messages = [
                new UserMessage($prompt),
            ];

            $response = Prism::text()
                ->using($provider, $model)
                ->withSystemPrompt($systemMessage)
                ->usingTemperature(0.5)
                ->withMaxTokens(2000)
                ->withMessages($messages)
                ->asText();

            $responseContent = $response->text;

            Log::info('AI Summary - Raw Response', [
                'proposal_id' => $proposal->id,
                'response_length' => strlen($responseContent),
                'response_preview' => substr($responseContent, 0, 500),
            ]);

            $jsonData = $this->extractJsonFromResponse($responseContent);

            if ($jsonData && is_array($jsonData) && isset($jsonData['summary']) && ! empty($jsonData['summary'])) {
                Log::info('AI Summary - Successfully Parsed', [
                    'proposal_id' => $proposal->id,
                    'keys' => array_keys($jsonData),
                ]);

                return $jsonData;
            }

            Log::warning('Failed to extract valid AI summary data', [
                'response_content' => $responseContent,
                'proposal_id' => $proposal->id,
                'extracted_json' => json_encode($jsonData),
            ]);

            return [];
        } catch (\Exception $e) {
            Log::error('AI summary generation failed', [
                'proposal_id' => $proposal->id,
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString(),
            ]);

            return [];
        }
    }

    private function extractJsonFromResponse(string $response): ?array
    {
        $cleaned = trim($response);
        $jsonData = json_decode($cleaned, true);
        if (json_last_error() === JSON_ERROR_NONE && is_array($jsonData)) {
            return $jsonData;
        }

        if (preg_match('/\{[\s\S]*\}/', $cleaned, $matches)) {
            $jsonData = json_decode($matches[0], true);
            if (json_last_error() === JSON_ERROR_NONE && is_array($jsonData)) {
                return $jsonData;
            }
        }

        $start = strpos($cleaned, '{');
        $end = strrpos($cleaned, '}');
        if ($start !== false && $end !== false && $end > $start) {
            $json = substr($cleaned, $start, $end - $start + 1);
            $jsonData = json_decode($json, true);
            if (json_last_error() === JSON_ERROR_NONE && is_array($jsonData)) {
                return $jsonData;
            }
        }

        return null;
    }

    private function buildSummaryPrompt(Proposal $proposal, string $title, string $problem, string $solution, string $experience, string $content): string
    {
        $fundingStatus = $proposal->funded_at ? 'funded' : 'unfunded';
        $amount = number_format($proposal->amount_requested);
        $openSource = $proposal->opensource ? 'Yes' : 'No';

        $promptTemplate = <<<'PROMPT'
You are an expert Project Catalyst proposal analyzer. Analyze this specific proposal and provide a comprehensive analysis with specific strengths and considerations.

**PROPOSAL DETAILS**
- Title: {title}
- Requested Amount: {amount} {currency}
- Status: {funding_status}
- Project Duration: {project_length} months
- Open Source: {open_source}

**PROBLEM STATEMENT**
{problem}

**SOLUTION APPROACH**
{solution}

**TEAM EXPERIENCE**
{experience}

---

Analyze this proposal thoroughly and return a JSON response with the following fields. Each field must be specific to this proposal:

**summary**: 2-3 sentences explaining what this proposal does, the problem it addresses, and why it matters for Cardano.

**one_sentence_summary**: One compelling sentence that captures the essence of this proposal.

**key_points**: Array of 3-4 specific insights about this proposal (not generic statements).

**strengths**: Array of 3-5 SPECIFIC strengths based on the actual proposal content. Include:
- How it targets specific ecosystem challenges mentioned in the problem
- Quality and detail of the implementation strategy
- Innovation or novel aspects
- Measurable outcomes or clear deliverables
Example: "Targets the lack of [specific thing] by [specific approach]"
Example: "Provides detailed implementation strategy with [specific technical approach]"

**considerations**: Array of 3-5 SPECIFIC questions that reviewers should consider:
- Ask how specific problems are addressed
- Request timeline and milestone details if not clear
- Ask about budget allocation if not explained
- Question feasibility or team capacity
Example: "How does this address the ecosystem challenge of [specific problem]?"
Example: "Can you clarify the project timeline and major milestones?"
Example: "How will the requested {amount} {currency} be allocated across different phases?"

CRITICAL RULES:
- Return ONLY valid JSON, nothing else
- Make UNIQUE observations specific to THIS proposal
- Do NOT use generic language or templates
- Strengths must affirm specific positive attributes from the content
- Considerations must ALWAYS be written as questions
- Reference actual details from the proposal

Return ONLY this JSON structure:
{
  "summary": "specific summary for this proposal",
  "one_sentence_summary": "one sentence specific to this proposal",
  "key_points": ["specific point 1", "specific point 2", "specific point 3"],
  "strengths": ["specific strength 1", "specific strength 2", "specific strength 3"],
  "considerations": ["question 1?", "question 2?", "question 3?"]
}
PROMPT;

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

    private function generateDefaultSummary(Proposal $proposal, string $problem, string $solution): string
    {
        $extractTitle = new ExtractProposalTitle;
        $title = $extractTitle($proposal);
        $fundingStatus = $proposal->funded_at ? 'funded' : 'unfunded';
        $amount = number_format($proposal->amount_requested);

        if (strlen($problem) > 0 && strlen($solution) > 0) {
            $cleanProblem = ucfirst($this->cleanProposalText($problem));
            $cleanSolution = ucfirst($this->cleanProposalText($solution));

            $intro = "'{$title}' is a {$fundingStatus} proposal requesting {$amount} {$proposal->currency}.";

            $problemStatement = "**It addresses:** {$cleanProblem}";

            // UPDATED: Wrapped solution output in bold (**)
            $solutionStatement = "**The solution provides:** {$cleanSolution}";

            return $intro.' '.$problemStatement.'. '.$solutionStatement.'. '.
                'The project includes defined milestones and measurable success metrics to track progress and impact.';
        }

        $problemSummary = strlen($problem) > 0 ? $problem : 'address ecosystem challenges';
        $solutionSummary = strlen($solution) > 0 ? $solution : 'provide structured implementation';

        // UPDATED: Wrapped solution output in bold (**) here as well for consistency
        return "'{$title}' is a {$fundingStatus} proposal requesting {$amount} {$proposal->currency} to address: {$problemSummary}. ".
            "**The proposal solution focuses on: {$solutionSummary}** ".
            'The project includes defined milestones and success metrics for tracking progress.';
    }

    private function cleanProposalText(string $text): string
    {
        $text = preg_replace('/^(There is|I propose|I will|Create|The lack of|We need|We will)\s+/i', '', $text);
        $text = preg_replace('/,\s*(which|that)\s+(hinders|prevents|limits|blocks|impedes)/i', '', $text);
        $text = preg_replace('/,\s*and\s+/i', ', ', $text);
        $text = trim($text, '.,;:!?');

        return trim($text);
    }

    private function generateDefaultOneSentence(Proposal $proposal): string
    {
        $extractTitle = new ExtractProposalTitle;
        $extractField = new ExtractProposalField;
        $title = $extractTitle($proposal);
        $amount = number_format($proposal->amount_requested);

        $problem = $extractField($proposal, 'problem') ?? '';
        $problemKeyword = strlen($problem) > 30 ? 'address critical ecosystem challenges' : 'support ecosystem development';
        $fundStatus = $proposal->funded_at ? 'funded' : 'unfunded';

        return "This {$fundStatus} proposal '{$title}' requests {$amount} {$proposal->currency} to {$problemKeyword} through a structured implementation approach.";
    }

    private function generateDefaultKeyPoints(string $problem, string $solution): array
    {
        $keyPoints = [];

        if (strlen($problem) > 0) {
            $cleanProblem = $this->cleanProposalText($problem);
            $keyPoints[] = 'Addresses: '.substr($cleanProblem, 0, 120).(strlen($cleanProblem) > 120 ? '...' : '');
        }

        if (strlen($solution) > 0) {
            $cleanSolution = $this->cleanProposalText($solution);
            $keyPoints[] = 'Solution: '.substr($cleanSolution, 0, 120).(strlen($cleanSolution) > 120 ? '...' : '');
        }

        if (count($keyPoints) < 3) {
            $keyPoints[] = 'Includes defined milestones and measurable success metrics';
        }

        return $keyPoints;
    }

    private function generateDefaultConsiderations(string $problem, string $solution): array
    {
        $considerations = [];

        if (preg_match('/(\w+)\s+(\w+)\s+(\w+)/i', $problem, $matches)) {
            $considerations[] = "How does this address the lack of {$matches[1]} in the ecosystem?";
        }

        if (strlen($problem) < 50) {
            $considerations[] = 'Provide more detail about the specific problem this addresses';
        }

        if (strlen($solution) < 50) {
            $considerations[] = 'Expand on the technical implementation and approach';
        }

        if (! preg_match('/(timeline|month|quarter|year|week)/i', $solution)) {
            $considerations[] = 'Clarify project timeline and milestone delivery schedule';
        }

        if (! preg_match('/(budget|cost|fund|allocation)/i', $solution)) {
            $considerations[] = 'Detail how the requested budget will be allocated';
        }

        return $considerations;
    }

    private function generateDefaultStrengths(string $problem, string $solution, string $experience): array
    {
        $strengths = [];

        // Extract keywords from problem to identify specific issues
        if (preg_match('/(\w+)\s+(\w+)/i', $problem, $matches)) {
            $strengths[] = "Targets {$matches[1]} {$matches[2]} challenges in the ecosystem";
        }

        // Check for innovation/novel approach indicators
        if (preg_match('/(novel|innovative|new|unique|first|pioneering)/i', $solution)) {
            $strengths[] = 'Proposes an innovative approach to ecosystem challenges';
        }

        // Check for measurable metrics
        if (preg_match('/(metric|measure|track|monitor|success|outcome)/i', $solution)) {
            $strengths[] = 'Includes measurable success criteria and outcome tracking';
        }

        // Check for team capability indicators
        if (strlen($experience) > 100) {
            $strengths[] = 'Team demonstrates relevant experience and background';
        }

        // Check for implementation detail
        if (strlen($solution) > 150) {
            $strengths[] = 'Provides detailed implementation strategy and approach';
        }

        if (count($strengths) === 0) {
            $strengths[] = 'Addresses identified ecosystem needs';
            $strengths[] = 'Includes defined milestones and deliverables';
            $strengths[] = 'Clear value proposition for the ecosystem';
        }

        return $strengths;
    }
}

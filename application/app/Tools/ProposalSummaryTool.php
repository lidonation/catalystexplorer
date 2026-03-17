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

    // Max character limits per field before truncation
    private const MAX_CHARS_CONTENT = 4000;

    private const MAX_CHARS_PROBLEM = 1500;

    private const MAX_CHARS_SOLUTION = 1500;

    private const MAX_CHARS_EXPERIENCE = 800;

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

            $dbJson = json_encode($summary);

            $proposal->update([
                'ai_summary' => $dbJson !== false ? $dbJson : json_encode(['error' => 'Data encoding failed']),
                'ai_generated_at' => now(),
            ]);

            $responseArray = [
                'success' => true,
                'summary' => $summary,
                'generated_at' => now()->toISOString(),
            ];

            $result = json_encode($responseArray);

            if ($result === false) {
                Log::error('ProposalSummaryTool JSON Failure', [
                    'proposal_id' => $proposalId,
                    'json_error' => json_last_error_msg(),
                ]);

                return json_encode([
                    'success' => false,
                    'error' => 'Internal encoding error: '.json_last_error_msg(),
                ]);
            }

            return $result;

        } catch (\Exception $e) {
            Log::error('ProposalSummaryTool error', [
                'proposal_id' => $proposalId,
                'error' => $e->getMessage(),
                'trace' => substr($e->getTraceAsString(), 0, 1000),
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
            'summary' => $aiSummary['summary'] ?? $this->generateDefaultSummary($proposal, $problem, $solution),
            'one_sentence_summary' => $aiSummary['one_sentence_summary'] ?? $this->generateDefaultOneSentence($proposal),
            'key_points' => $aiSummary['key_points'] ?? [],
            'strengths' => $aiSummary['strengths'] ?? [],
            'considerations' => $aiSummary['considerations'] ?? [],
        ];
    }

    private function generateAiSummary(Proposal $proposal, string $title, string $problem, string $solution, string $experience, string $content): array
    {
        $provider = config('vizra-adk.default_provider', env('VIZRA_ADK_DEFAULT_PROVIDER', 'ollama'));
        $model = config('vizra-adk.default_model', env('VIZRA_ADK_DEFAULT_MODEL', 'llama3.1:8b'));
        $timeout = (int) env('PRISM_REQUEST_TIMEOUT', 120);

        try {
            $prompt = $this->buildSummaryPrompt($proposal, $title, $problem, $solution, $experience, $content);

            $systemMessage = 'You are an expert Project Catalyst proposal analyzer. Analyze proposals in detail and provide UNIQUE, specific insights based on their actual content. Return ONLY valid JSON with these exact fields: summary, one_sentence_summary, key_points (array), strengths (array), considerations (array).';

            $estimatedTokens = (int) (strlen($prompt) / 4);

            Log::info('AI Summary - LLM Call Started', [
                'proposal_id' => $proposal->id,
                'provider' => $provider,
                'model' => $model,
                'timeout_setting' => $timeout,
                'prompt_chars' => strlen($prompt),
                'estimated_tokens' => $estimatedTokens,
            ]);

            $messages = [
                new UserMessage($prompt),
            ];

            $response = Prism::text()
                ->using($provider, $model)
                ->withClientOptions(['timeout' => $timeout])
                ->withSystemPrompt($systemMessage)
                ->usingTemperature(0.5)
                ->withMaxTokens(2000)
                ->withMessages($messages)
                ->asText();

            $responseContent = $response->text;

            Log::info('AI Summary - Raw Response Received', [
                'proposal_id' => $proposal->id,
                'response_length' => strlen($responseContent),
            ]);

            $jsonData = $this->extractJsonFromResponse($responseContent);

            if ($jsonData && is_array($jsonData) && isset($jsonData['summary']) && ! empty($jsonData['summary'])) {
                Log::info('AI Summary - Successfully Parsed', [
                    'proposal_id' => $proposal->id,
                    'keys' => array_keys($jsonData),
                ]);

                return $jsonData;
            }

            Log::warning('AI summary parse failed — using fallback defaults', [
                'proposal_id' => $proposal->id,
                'raw_response' => substr($responseContent, 0, 500),
                'json_error' => json_last_error_msg(),
            ]);

            return [];

        } catch (\Exception $e) {
            Log::error('AI summary generation failed', [
                'proposal_id' => $proposal->id,
                'provider' => $provider,
                'model' => $model,
                'error' => $e->getMessage(),
                'trace' => substr($e->getTraceAsString(), 0, 1000),
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

    /**
     * Truncate a field to a maximum character length.
     * Appends a notice if the content was cut so the LLM knows it was truncated.
     */
    private function truncateField(string $text, int $maxChars): string
    {
        if (strlen($text) <= $maxChars) {
            return $text;
        }

        return substr($text, 0, $maxChars)."\n\n[... truncated for brevity ...]";
    }

    private function buildSummaryPrompt(Proposal $proposal, string $title, string $problem, string $solution, string $experience, string $content): string
    {
        $fundingStatus = $proposal->funded_at ? 'funded' : 'unfunded';
        $amount = number_format($proposal->amount_requested);
        $openSource = $proposal->opensource ? 'Yes' : 'No';

        // Truncate large fields before injecting into the prompt to avoid exceeding
        // provider token limits (e.g. Groq PrismRequestTooLargeException).
        $problem = $this->truncateField($problem, self::MAX_CHARS_PROBLEM);
        $solution = $this->truncateField($solution, self::MAX_CHARS_SOLUTION);
        $experience = $this->truncateField($experience, self::MAX_CHARS_EXPERIENCE);
        $content = $this->truncateField($content, self::MAX_CHARS_CONTENT);

        $promptTemplate = <<<'PROMPT'
You are an expert Project Catalyst proposal analyzer. Analyze this specific proposal in detail and provide UNIQUE insights based on its actual content.

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

**FULL PROPOSAL CONTENT**
{content}

---

Analyze this proposal and provide a comprehensive evaluation focusing on the following:

1. PROBLEM
Identify the specific ecosystem problem being addressed and explain why this issue matters for the Cardano ecosystem.

2. SOLUTION
Explain how the proposed solution addresses the problem. Identify whether the approach is innovative, practical, scalable, or infrastructure-focused.

3. BUDGET
Assess whether the requested {amount} {currency} appears reasonable relative to the scope and expected outcomes.

4. IMPACT
Describe the expected impact on the Cardano ecosystem. Identify who benefits (developers, users, adoption, tooling, education, etc.).

5. FEASIBILITY
Evaluate how realistic the implementation is based on the proposal scope, team experience, and described approach.

---

STRENGTHS

Provide **3–5 strengths** that represent **clear advantages of this proposal**.

Strengths must:
- Reference actual information from the proposal
- Highlight ecosystem value
- Identify quality of implementation strategy
- Mention innovation, scalability, or adoption potential where relevant

Examples of good strengths:
- "Addresses the lack of developer tooling for onboarding."
- "Provides a detailed technical implementation strategy."
- "Targets adoption in underserved regions."

---

CONSIDERATIONS

Provide **3–5 thoughtful questions** that reviewers or voters should consider before supporting this proposal.

These should:
- Ask for clarification
- Highlight possible risks or uncertainties
- Encourage deeper evaluation

Examples:
- "How will the project measure adoption and success metrics?"
- "What milestones ensure delivery within the proposed timeline?"
- "How will the solution be maintained after Catalyst funding?"

---

Return ONLY valid JSON with this exact structure:

{
  "summary": "A detailed 2-3 sentence summary explaining the proposal problem, solution, and ecosystem impact.",
  "one_sentence_summary": "One clear sentence capturing the essence of the proposal.",
  "key_points": [
    "Key insight about the proposal",
    "Another important takeaway",
    "Third key insight"
  ],
  "strengths": [
    "Specific strength of the proposal",
    "Another strength",
    "Another strength"
  ],
  "considerations": [
    "Question reviewers should consider?",
    "Another thoughtful question?",
    "Another evaluation question?"
  ]
}

IMPORTANT:
- Make UNIQUE observations based on the proposal content.
- Avoid generic or template language.
- Strengths should affirm positive attributes found in the proposal.
- Considerations must always be written as questions.
- Always return valid JSON.
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
            $solutionStatement = "**The solution provides:** {$cleanSolution}";

            return $intro.' '.$problemStatement.'. '.$solutionStatement.'. '.
                'The project includes defined milestones and measurable success metrics to track progress and impact.';
        }

        $problemSummary = strlen($problem) > 0 ? $problem : 'address ecosystem challenges';
        $solutionSummary = strlen($solution) > 0 ? $solution : 'provide structured implementation';

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
}

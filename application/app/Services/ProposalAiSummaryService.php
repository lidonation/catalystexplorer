<?php

declare(strict_types=1);

namespace App\Services;

use App\Actions\Ai\ExtractProposalField;
use App\Actions\Ai\ExtractProposalTitle;
use App\Models\Proposal;
use Illuminate\Support\Facades\Log;
use Prism\Prism\Facades\Prism;
use Prism\Prism\ValueObjects\Messages\UserMessage;

class ProposalAiSummaryService
{
    public function __construct(
        private readonly ExtractProposalTitle $extractTitle,
        private readonly ExtractProposalField $extractField,
    ) {}

    /**
     * Generate an AI summary for a proposal (synchronously).
     *
     * If the proposal already has a summary and $force is false, returns the existing one.
     * Otherwise generates a new summary via LLM, persists it, and returns it.
     *
     * @return string|null The summary text, or null on failure.
     */
    public function generate(Proposal $proposal, bool $force = false): ?string
    {
        if (! $force && $proposal->ai_generated_at !== null && ! empty($proposal->ai_summary)) {
            return $proposal->ai_summary;
        }

        try {
            $prompt = $this->buildPrompt($proposal);

            $provider = config('vizra-adk.default_provider', 'ollama');
            $model = config('vizra-adk.default_model', 'llama3.1:8b');

            $response = Prism::text()
                ->using($provider, $model)
                ->withSystemPrompt('You are a concise technical writer summarizing blockchain governance proposals. Write clear, factual summaries.')
                ->usingTemperature(0.3)
                ->withMaxTokens(150)
                ->withMessages([new UserMessage($prompt)])
                ->asText();

            $summary = trim($response->text);

            if (empty($summary)) {
                Log::warning('AI returned empty summary', ['proposal_id' => $proposal->id]);

                return null;
            }

            $proposal->update([
                'ai_summary' => $summary,
                'ai_generated_at' => now(),
            ]);

            Log::info('Generated AI summary', [
                'proposal_id' => $proposal->id,
                'summary_length' => mb_strlen($summary),
            ]);

            return $summary;
        } catch (\Throwable $e) {
            Log::error('Failed to generate AI summary', [
                'proposal_id' => $proposal->id,
                'error' => $e->getMessage(),
            ]);

            return null;
        }
    }

    /**
     * Build the LLM prompt using all available proposal fields.
     *
     * This produces a richer summary than the original job which only used
     * title, problem, solution, experience, budget, and open-source status.
     */
    private function buildPrompt(Proposal $proposal): string
    {
        $title = ($this->extractTitle)($proposal);

        // Core fields (same as before)
        $problem = mb_substr(($this->extractField)($proposal, 'problem') ?? '', 0, 600);
        $solution = mb_substr(($this->extractField)($proposal, 'solution') ?? '', 0, 600);
        $experience = mb_substr(($this->extractField)($proposal, 'experience') ?? '', 0, 300);
        $budget = $proposal->amount_requested.' '.$proposal->currency;
        $openSource = $proposal->opensource ? 'Yes' : 'No';

        // Additional fields for richer context
        $status = $proposal->status ?? '';
        $fundingStatus = $proposal->funding_status ?? '';
        $category = is_array($proposal->category) ? json_encode($proposal->category) : ($proposal->category ?? '');
        $projectLength = $proposal->project_length ? $proposal->project_length.' months' : '';

        $definitionOfSuccess = mb_substr(($this->extractField)($proposal, 'definition_of_success') ?? '', 0, 300);
        $content = mb_substr(($this->extractField)($proposal, 'content') ?? '', 0, 400);
        $quickpitch = mb_substr($proposal->quickpitch ?? '', 0, 200);
        $website = $proposal->website ?? '';

        // Structured JSONB fields
        $projectDetails = $this->summarizeJsonField($proposal->project_details, 400);
        $pitch = $this->summarizeJsonField($proposal->pitch, 300);
        $categoryQuestions = $this->summarizeJsonField($proposal->category_questions, 300);

        // Build prompt parts — only include non-empty fields
        $parts = array_filter([
            "Title: {$title}",
            $problem ? "Problem: {$problem}" : null,
            $solution ? "Solution: {$solution}" : null,
            $experience ? "Team Experience: {$experience}" : null,
            "Budget: {$budget}",
            "Open Source: {$openSource}",
            $status ? "Status: {$status}" : null,
            $fundingStatus ? "Funding Status: {$fundingStatus}" : null,
            $category ? "Category: {$category}" : null,
            $projectLength ? "Project Length: {$projectLength}" : null,
            $definitionOfSuccess ? "Definition of Success: {$definitionOfSuccess}" : null,
            $content ? "Content: {$content}" : null,
            $projectDetails ? "Project Details: {$projectDetails}" : null,
            $pitch ? "Pitch: {$pitch}" : null,
            $categoryQuestions ? "Category Questions: {$categoryQuestions}" : null,
            $quickpitch ? "Quick Pitch: {$quickpitch}" : null,
            $website ? "Website: {$website}" : null,
        ]);

        $fieldsBlock = implode("\n", $parts);

        return <<<PROMPT
        Summarize this Project Catalyst proposal in 1-2 sentences. Be specific about what the proposal does and its potential impact. Do not include scores or recommendations.

        {$fieldsBlock}

        Return ONLY the summary text, no JSON, no markdown, no labels.
        PROMPT;
    }

    /**
     * Flatten a JSONB array field into a brief text representation.
     */
    private function summarizeJsonField(?array $data, int $maxLength = 400): string
    {
        if (empty($data)) {
            return '';
        }

        $segments = [];
        foreach ($data as $key => $value) {
            if ($value === null) {
                continue;
            }

            $text = is_array($value)
                ? ($value['en'] ?? implode(' ', array_filter($value, 'is_string')))
                : (string) $value;

            $text = trim($text);
            if ($text !== '') {
                $segments[] = ucfirst((string) $key).': '.mb_substr($text, 0, 200);
            }
        }

        $combined = implode('; ', $segments);

        return mb_strlen($combined) > $maxLength
            ? mb_substr($combined, 0, $maxLength - 3).'...'
            : $combined;
    }
}

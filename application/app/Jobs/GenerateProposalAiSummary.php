<?php

declare(strict_types=1);

namespace App\Jobs;

use App\Actions\Ai\ExtractProposalField;
use App\Actions\Ai\ExtractProposalTitle;
use App\Models\Proposal;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\Middleware\WithoutOverlapping;
use Illuminate\Queue\SerializesModels;
use Illuminate\Support\Facades\Log;
use Prism\Prism\Facades\Prism;
use Prism\Prism\ValueObjects\Messages\UserMessage;

class GenerateProposalAiSummary implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    public int $timeout = 180;

    public int $tries = 3;

    public int $backoff = 60;

    public function __construct(
        public Proposal $proposal,
        public bool $force = false,
    ) {}

    /**
     * Prevent overlapping jobs for the same proposal.
     */
    public function middleware(): array
    {
        return [
            (new WithoutOverlapping($this->proposal->id))
                ->releaseAfter(180)
                ->expireAfter(300),
        ];
    }

    public function handle(): void
    {
        if (! $this->force && $this->proposal->ai_generated_at !== null) {
            Log::debug('Skipping AI summary — already generated', [
                'proposal_id' => $this->proposal->id,
                'ai_generated_at' => $this->proposal->ai_generated_at,
            ]);

            return;
        }

        try {
            $title = (new ExtractProposalTitle)($this->proposal);
            $extractField = new ExtractProposalField;

            $problem = mb_substr($extractField($this->proposal, 'problem') ?? '', 0, 600);
            $solution = mb_substr($extractField($this->proposal, 'solution') ?? '', 0, 600);
            $experience = mb_substr($extractField($this->proposal, 'experience') ?? '', 0, 300);
            $budget = $this->proposal->amount_requested.' '.$this->proposal->currency;
            $openSource = $this->proposal->opensource ? 'Yes' : 'No';

            $prompt = <<<PROMPT
            Summarize this Project Catalyst proposal in 1-2 sentences. Be specific about what the proposal does and its potential impact. Do not include scores or recommendations.

            Title: {$title}
            Problem: {$problem}
            Solution: {$solution}
            Team Experience: {$experience}
            Budget: {$budget}
            Open Source: {$openSource}

            Return ONLY the summary text, no JSON, no markdown, no labels.
            PROMPT;

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
                Log::warning('AI returned empty summary', ['proposal_id' => $this->proposal->id]);

                return;
            }

            $this->proposal->update([
                'ai_summary' => $summary,
                'ai_generated_at' => now(),
            ]);

            Log::info('Generated AI summary', [
                'proposal_id' => $this->proposal->id,
                'summary_length' => mb_strlen($summary),
            ]);
        } catch (\Throwable $e) {
            Log::error('Failed to generate AI summary', [
                'proposal_id' => $this->proposal->id,
                'error' => $e->getMessage(),
            ]);

            throw $e;
        }
    }
}

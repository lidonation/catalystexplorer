<?php

declare(strict_types=1);

namespace App\Nova\Actions;

use App\Services\ProposalAiSummaryService;
use Illuminate\Bus\Queueable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Support\Collection;
use Laravel\Nova\Actions\Action;
use Laravel\Nova\Actions\ActionResponse;
use Laravel\Nova\Fields\ActionFields;
use Laravel\Nova\Fields\Boolean;

class GenerateAiSummary extends Action
{
    use InteractsWithQueue, Queueable;

    public $name = 'Generate AI Summary';

    public function handle(ActionFields $fields, Collection $models): ActionResponse
    {
        $force = $fields->get('force', false);
        $service = app(ProposalAiSummaryService::class);
        $generated = 0;
        $failed = 0;

        foreach ($models as $proposal) {
            if (! $force && $proposal->ai_generated_at !== null) {
                continue;
            }

            $result = $service->generate($proposal, (bool) $force);
            if ($result !== null) {
                $generated++;
            } else {
                $failed++;
            }
        }

        if ($generated === 0 && $failed === 0) {
            return ActionResponse::message('All selected proposals already have AI summaries. Use "Force regenerate" to overwrite.');
        }

        $message = "Generated AI summaries for {$generated} proposal(s).";
        if ($failed > 0) {
            $message .= " {$failed} failed.";
        }

        return ActionResponse::message($message);
    }

    public function fields(\Laravel\Nova\Http\Requests\NovaRequest $request): array
    {
        return [
            Boolean::make('Force regenerate', 'force')
                ->help('Regenerate even if an AI summary already exists.')
                ->default(false),
        ];
    }
}

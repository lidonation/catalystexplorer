<?php

declare(strict_types=1);

namespace App\Nova\Actions;

use App\Jobs\GenerateProposalAiSummary;
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
        $dispatched = 0;

        foreach ($models as $proposal) {
            if (! $force && $proposal->ai_generated_at !== null) {
                continue;
            }

            GenerateProposalAiSummary::dispatch($proposal, (bool) $force)->onQueue('ai');
            $dispatched++;
        }

        if ($dispatched === 0) {
            return ActionResponse::message('All selected proposals already have AI summaries. Use "Force regenerate" to overwrite.');
        }

        return ActionResponse::message("Dispatched AI summary generation for {$dispatched} proposal(s).");
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

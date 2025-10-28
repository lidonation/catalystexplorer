<?php

declare(strict_types=1);

namespace App\Http\Controllers;

use App\Enums\ConversionType;
use App\Enums\ConvertListWorkflowParams;
use App\Models\BookmarkCollection;
use App\Models\Fund;
use App\Models\Proposal;
use App\Models\Scopes\PublicVisibilityScope;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Collection;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Gate;
use Inertia\Inertia;
use Inertia\Response;

class ConvertListWorkflowController extends Controller
{
    /**
     * Handle workflow step routing
     */
    public function handleStep(Request $request, $step): mixed
    {
        $method = "step{$step}";

        if (method_exists($this, $method)) {
            return $this->$method($request);
        }

        abort(404, __('workflows.convertList.errors.stepNotFound', ['step' => $step]));
    }

    public function step1(Request $request): Response
    {
        $validated = $request->validate([
            ConvertListWorkflowParams::COLLECTION_HASH()->value => 'required|string',
        ]);

        $collection = BookmarkCollection::withoutGlobalScope(PublicVisibilityScope::class)
            ->find($validated[ConvertListWorkflowParams::COLLECTION_HASH()->value]);

        if (! $collection) {
            abort(404, __('workflows.convertList.errors.collectionNotFound'));
        }

        Gate::authorize('update', $collection);

        $currentType = $collection->list_type;
        $conversionType = $currentType === 'voter' ? ConversionType::TO_RESEARCH()->value : ConversionType::TO_VOTER()->value;

        $validationResults = $this->validateConversion($collection, $conversionType);

        return Inertia::render('Workflows/ConvertList/Step1', [
            'stepDetails' => $this->getStepDetails(),
            'activeStep' => 1,
            'collection' => $collection,
            'currentType' => $currentType,
            'conversionType' => $conversionType,
            'validationResults' => $validationResults,
            'canConvert' => $validationResults['canConvert'],
        ]);
    }

    public function step2(Request $request): Response
    {
        $validated = $request->validate([
            ConvertListWorkflowParams::COLLECTION_HASH()->value => 'required|string',
            ConvertListWorkflowParams::CONVERSION_TYPE()->value => 'required|string|in:'.ConversionType::TO_VOTER()->value.','.ConversionType::TO_RESEARCH()->value,
        ]);

        $collection = BookmarkCollection::withoutGlobalScope(PublicVisibilityScope::class)
            ->find($validated[ConvertListWorkflowParams::COLLECTION_HASH()->value]);

        if (! $collection) {
            abort(404, __('workflows.convertList.errors.collectionNotFound'));
        }

        return Inertia::render('Workflows/ConvertList/Step2', [
            'stepDetails' => $this->getStepDetails(),
            'activeStep' => 2,
            'collection' => $collection,
            'conversionType' => $validated[ConvertListWorkflowParams::CONVERSION_TYPE()->value],
        ]);
    }

    public function convert(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            ConvertListWorkflowParams::COLLECTION_HASH()->value => 'required|string',
            ConvertListWorkflowParams::CONVERSION_TYPE()->value => 'required|string|in:'.ConversionType::TO_VOTER()->value.','.ConversionType::TO_RESEARCH()->value,
        ]);

        $collection = BookmarkCollection::withoutGlobalScope(PublicVisibilityScope::class)
            ->find($validated[ConvertListWorkflowParams::COLLECTION_HASH()->value]);

        if (! $collection) {
            abort(404, __('workflows.convertList.errors.collectionNotFound'));
        }

        Gate::authorize('update', $collection);

        $conversionType = $validated[ConvertListWorkflowParams::CONVERSION_TYPE()->value];

        // Validate conversion is allowed
        $validationResults = $this->validateConversion($collection, $conversionType);

        if (! $validationResults['canConvert']) {
            return redirect()->back()->withErrors([
                'conversion' => __('workflows.convertList.errors.cannotConvert'),
            ]);
        }

        try {
            DB::transaction(function () use ($collection, $conversionType) {
                if ($conversionType === ConversionType::TO_VOTER()->value) {
                    $firstProposal = $collection->proposals()->first();
                    if ($firstProposal && $firstProposal->model) {
                        $collection->fund_id = $firstProposal->model->fund_id;
                        $collection->save();
                    }
                } else {
                    $collection->fund_id = null;
                    $collection->save();
                }
            });

            return redirect()->route('workflows.convertList.index', [
                'step' => 2,
                ConvertListWorkflowParams::COLLECTION_HASH()->value => $collection->id,
                ConvertListWorkflowParams::CONVERSION_TYPE()->value => $conversionType,
            ]);
        } catch (\Exception $e) {
            return redirect()->back()->withErrors([
                'conversion' => __('workflows.convertList.errors.conversionError', ['error' => $e->getMessage()]),
            ]);
        }
    }

    protected function validateConversion(BookmarkCollection $collection, string $conversionType): array
    {
        $checks = [];
        $canConvert = true;

        if ($conversionType === ConversionType::TO_VOTER()->value) {

            $hasOnlyProposals = $collection->items()
                ->where('model_type', '!=', Proposal::class)
                ->count() === 0;

            $checks[] = [
                'label' => __('workflows.convertList.checks.listContainsOnlyProposals'),
                'passed' => $hasOnlyProposals,
                'required' => true,
            ];

            if (! $hasOnlyProposals) {
                $canConvert = false;
            }

            $proposalItems = $collection->proposals()->get();
            $fundIds = $proposalItems->map(function ($item) {
                return $item->model?->fund_id;
            })->filter()->unique();

            $allFromSameFund = $fundIds->count() <= 1;

            $checks[] = [
                'label' => __('workflows.convertList.checks.allProposalsFromSameFund'),
                'passed' => $allFromSameFund,
                'required' => true,
                'fundTitle' => $fundIds->count() === 1
                    ? Fund::find($fundIds->first())?->title
                    : null,
            ];

            if (! $allFromSameFund) {
                $canConvert = false;
            }

            // Check 3: List has not been submitted on-chain
            $notSubmittedOnChain = is_null($collection->signatures()->first());

            $checks[] = [
                'label' => __('workflows.convertList.checks.notSubmittedOnChain'),
                'passed' => $notSubmittedOnChain,
                'required' => true,
            ];

            if (! $notSubmittedOnChain) {
                $canConvert = false;
            }

            $hasOnlyOneContributor = $collection->collaborators()->count() === 0;

            $checks[] = [
                'label' => __('workflows.convertList.checks.hasOnlyOneContributor'),
                'passed' => $hasOnlyOneContributor,
                'required' => true,
            ];

            if (! $hasOnlyOneContributor) {
                $canConvert = false;
            }
        } else {

            $fundTitle = $collection->fund ? $collection->fund->title : __('workflows.convertList.fundTitle.unknown');

            $checks[] = [
                'label' => __('workflows.convertList.checks.fundLinkWillBeRemoved', ['fundTitle' => $fundTitle]),
                'passed' => true,
                'required' => false,
            ];

            $checks[] = [
                'label' => __('workflows.convertList.checks.cannotSubmitOnChain'),
                'passed' => true,
                'required' => false,
            ];

            $checks[] = [
                'label' => __('workflows.convertList.checks.canAddCollaborators'),
                'passed' => true,
                'required' => false,
            ];

            $checks[] = [
                'label' => __('workflows.convertList.checks.canAddOtherItems'),
                'passed' => true,
                'required' => false,
            ];
        }

        return [
            'checks' => $checks,
            'canConvert' => $canConvert,
        ];
    }

    public function getStepDetails(): Collection
    {
        return collect([
            [
                'title' => __('workflows.convertList.steps.reviewRequirements'),
                'info' => __('workflows.convertList.steps.reviewRequirementsInfo'),
            ],
            [
                'title' => __('workflows.convertList.steps.success'),
                'info' => __('workflows.convertList.steps.successInfo'),
            ],
        ]);
    }
}

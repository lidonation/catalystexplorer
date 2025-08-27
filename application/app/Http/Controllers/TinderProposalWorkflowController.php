<?php

declare(strict_types=1);

namespace App\Http\Controllers;

use App\DataTransferObjects\BookmarkCollectionData;
use App\DataTransferObjects\FundData;
use App\DataTransferObjects\ProposalData;
use App\Enums\BookmarkableType;
use App\Enums\BookmarkStatus;
use App\Enums\TinderWorkflowParams;
use App\Enums\VoteEnum;
use App\Models\BookmarkCollection;
use App\Models\BookmarkItem;
use App\Models\Fund;
use App\Models\Proposal;
use App\Models\TinderCollection;
use App\Repositories\ProposalRepository;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Pagination\LengthAwarePaginator;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Fluent;
use Illuminate\Support\Str;
use Inertia\Inertia;
use Inertia\Response;

class TinderProposalWorkflowController extends Controller
{
    public function handleStep(Request $request, $step): mixed
    {
        $method = "step{$step}";

        if (method_exists($this, $method)) {
            return $this->$method($request);
        }

        abort(404, "Step '{$step}' not found.");
    }

    public function step1(Request $request): Response
    {
        $validated = $request->validate([
            TinderWorkflowParams::EDIT()->value => 'nullable|boolean',
            TinderWorkflowParams::TINDER_COLLECTION_HASH()->value => 'nullable|string',
            TinderWorkflowParams::LEFT_BOOKMARK_COLLECTION_HASH()->value => 'nullable|string',
            TinderWorkflowParams::RIGHT_BOOKMARK_COLLECTION_HASH()->value => 'nullable|string',
            TinderWorkflowParams::FUNDS()->value => 'string',
        ]);

        $isEditMode = ! empty($validated[TinderWorkflowParams::EDIT()->value]) && $validated[TinderWorkflowParams::EDIT()->value] == true;

        $shouldClearSession = ! $isEditMode;

        if ($shouldClearSession) {
            session()->forget([
                'tinder_proposal_preferences',
                'tinder_proposal_current_index',
                'tinder_proposal_total_seen',
                'tinder_proposal_current_page',
            ]);
        } else {
            // In edit mode, clear progress-related session data but keep preferences
            session()->forget([
                'tinder_proposal_current_index',
                'tinder_proposal_total_seen',
                'tinder_proposal_current_page',
            ]);
        }

        // Get existing preferences if in edit mode
        $existingPreferences = $isEditMode ? session('tinder_proposal_preferences', []) : null;

        $funds = Fund::with(['campaigns' => function ($query) {
            $query->orderBy('created_at', 'desc');
        }])
            ->orderBy('launched_at', 'desc')
            ->get();

        $latestFund = $funds->first();

        $selectedFund = null;
        $selectedFundCampaigns = null;
        $fundHash = $validated[TinderWorkflowParams::FUNDS()->value] ?? null;

        if ($fundHash) {
            $selectedFund = $funds->firstWhere('hash', $fundHash);
            $selectedFundCampaigns = $selectedFund?->campaigns ?? collect();
        } elseif ($isEditMode && $existingPreferences && isset($existingPreferences['selectedFund'])) {
            // In edit mode, find the previously selected fund
            $selectedFund = $funds->firstWhere('hash', $existingPreferences['selectedFund']);
            $selectedFundCampaigns = $selectedFund?->campaigns ?? collect();
        } else {
            $selectedFund = $latestFund;
            $selectedFundCampaigns = $latestFund?->campaigns ?? collect();
        }

        // Build filters array
        $filters = [];
        if ($selectedFund) {
            $filters[TinderWorkflowParams::FUNDS()->value] = $selectedFund->hash;
        }

        return Inertia::render('Workflows/TinderProposal/Step1', [
            'stepDetails' => $this->getStepDetails(),
            'activeStep' => intval($request->step),
            'latestFund' => $latestFund,
            'funds' => FundData::collect($funds),
            'filters' => $filters,
            'existingPreferences' => $existingPreferences,
            'campaigns' => $selectedFundCampaigns,
            'isEditMode' => $isEditMode,
            'tinderCollectionHash' => $validated[TinderWorkflowParams::TINDER_COLLECTION_HASH()->value] ?? null,
            'tinderCollectionId' => $validated[TinderWorkflowParams::TINDER_COLLECTION_HASH()->value] ?? null,
            'leftBookmarkCollectionHash' => $validated[TinderWorkflowParams::LEFT_BOOKMARK_COLLECTION_HASH()->value] ?? null,
            'leftBookmarkCollectionId' => $validated[TinderWorkflowParams::LEFT_BOOKMARK_COLLECTION_HASH()->value] ?? null,
            'rightBookmarkCollectionHash' => $validated[TinderWorkflowParams::RIGHT_BOOKMARK_COLLECTION_HASH()->value] ?? null,
            'rightBookmarkCollectionId' => $validated[TinderWorkflowParams::RIGHT_BOOKMARK_COLLECTION_HASH()->value] ?? null,
            'campaign' => $request->get('campaign'),
        ]);
    }

    public function step2(Request $request): Response|RedirectResponse
    {
        // Get stored preferences from session
        $preferences = session('tinder_proposal_preferences', []);

        $validated = $request->validate([
            TinderWorkflowParams::RIGHT_BOOKMARK_COLLECTION_HASH()->value => 'nullable|string',
            TinderWorkflowParams::LEFT_BOOKMARK_COLLECTION_HASH()->value => 'nullable|string',
            TinderWorkflowParams::TINDER_COLLECTION_HASH()->value => 'nullable|string',
        ]);

        // If no preferences are found, redirect back to step 1
        if (empty($preferences)) {
            return redirect()->route('workflows.tinderProposal.index', ['step' => 1]);
        }

        // Get fund details for display
        $selectedFund = null;
        if (isset($preferences['selectedFund'])) {
            $selectedFund = Fund::find($preferences['selectedFund']);
        }

        // Get collections from request parameters or session fallback
        $leftBookmarkCollection = null;
        $rightBookmarkCollection = null;
        $tinderCollection = null;

        if (! empty($validated[TinderWorkflowParams::LEFT_BOOKMARK_COLLECTION_HASH()->value]) || $request->filled('leftBookmarkCollectionId')) {
            $leftBookmarkCollection = BookmarkCollection::find($validated[TinderWorkflowParams::LEFT_BOOKMARK_COLLECTION_HASH()->value] ?? $request->input('leftBookmarkCollectionId'));
        }

        if (! empty($validated[TinderWorkflowParams::RIGHT_BOOKMARK_COLLECTION_HASH()->value]) || $request->filled('rightBookmarkCollectionId')) {
            $rightBookmarkCollection = BookmarkCollection::find($validated[TinderWorkflowParams::RIGHT_BOOKMARK_COLLECTION_HASH()->value] ?? $request->input('rightBookmarkCollectionId'));
        }

        if (! empty($validated[TinderWorkflowParams::TINDER_COLLECTION_HASH()->value])) {
            $tinderCollection = TinderCollection::find($validated[TinderWorkflowParams::TINDER_COLLECTION_HASH()->value]);
        }

        $step2Data = $this->getStep2DataFromCollections($leftBookmarkCollection, $rightBookmarkCollection, $tinderCollection, $request);

        return Inertia::render('Workflows/TinderProposal/Step2', [
            'stepDetails' => $this->getStepDetails(),
            'activeStep' => intval($request->step),
            'preferences' => $preferences,
            'step2Data' => $step2Data,
            'tinderCollectionHash' => $validated[TinderWorkflowParams::TINDER_COLLECTION_HASH()->value] ?? null,
            'leftBookmarkCollectionHash' => $validated[TinderWorkflowParams::LEFT_BOOKMARK_COLLECTION_HASH()->value] ?? null,
            'rightBookmarkCollectionHash' => $validated[TinderWorkflowParams::RIGHT_BOOKMARK_COLLECTION_HASH()->value] ?? null,
            'selectedFund' => $selectedFund ? [
                'id' => $selectedFund->id,
                'title' => $selectedFund->title,
                'slug' => $selectedFund->slug,
            ] : null,
        ]);
    }

    public function step3(Request $request): Response
    {

        $validated = $request->validate([
            TinderWorkflowParams::RIGHT_BOOKMARK_COLLECTION_HASH()->value => 'nullable|string',
            TinderWorkflowParams::LEFT_BOOKMARK_COLLECTION_HASH()->value => 'nullable|string',
            TinderWorkflowParams::TINDER_COLLECTION_HASH()->value => 'nullable|string',
            TinderWorkflowParams::PAGE()->value => 'nullable|string',
            TinderWorkflowParams::LOAD_MORE()->value => 'nullable|boolean',
        ]);

        $tinderCollectionHash = ! empty($validated[TinderWorkflowParams::TINDER_COLLECTION_HASH()->value]) ? $validated[TinderWorkflowParams::TINDER_COLLECTION_HASH()->value] : ($request->input('tinderCollectionId') ?? null);
        $leftBookmarkCollectionHash = ! empty($validated[TinderWorkflowParams::LEFT_BOOKMARK_COLLECTION_HASH()->value]) ? $validated[TinderWorkflowParams::LEFT_BOOKMARK_COLLECTION_HASH()->value] : ($request->input('leftBookmarkCollectionId') ?? null);
        $rightBookmarkCollectionHash = ! empty($validated[TinderWorkflowParams::RIGHT_BOOKMARK_COLLECTION_HASH()->value]) ? $validated[TinderWorkflowParams::RIGHT_BOOKMARK_COLLECTION_HASH()->value] : ($request->input('rightBookmarkCollectionId') ?? null);

        $savedCurrentIndex = session('tinder_proposal_current_index', 0);
        $savedTotalSeen = session('tinder_proposal_total_seen', 0);
        $savedCurrentPage = session('tinder_proposal_current_page', null);

        $page = 1;
        if (! empty($validated[TinderWorkflowParams::PAGE()->value])) {
            // Use page from URL parameter (for load more, navigation, etc.)
            $page = intval($validated[TinderWorkflowParams::PAGE()->value]);
        } elseif ($savedCurrentPage !== null) {
            // Use saved page from session (when returning from step 2)
            $page = $savedCurrentPage;
        } else {
            // Fallback: calculate page from saved index
            $proposalsPerPage = 20; // Should match the limit in fetchProposals
            $page = $savedCurrentIndex > 0 ? intval(ceil(($savedCurrentIndex + 1) / $proposalsPerPage)) : 1;
        }

        $tinderCollection = null;
        $leftBookmarkCollection = null;
        $rightBookmarkCollection = null;

        $filters = [];

        if ($tinderCollectionHash) {
            $tinderCollection = TinderCollection::find($tinderCollectionHash);
            $filters[TinderWorkflowParams::TINDER_COLLECTION_HASH()->value] = $tinderCollectionHash;
        }

        if ($leftBookmarkCollectionHash) {
            $leftBookmarkCollection = BookmarkCollection::find($leftBookmarkCollectionHash);
            $filters[TinderWorkflowParams::LEFT_BOOKMARK_COLLECTION_HASH()->value] = $leftBookmarkCollectionHash;
        }

        if ($rightBookmarkCollectionHash) {
            $rightBookmarkCollection = BookmarkCollection::find($rightBookmarkCollectionHash);
            $filters[TinderWorkflowParams::RIGHT_BOOKMARK_COLLECTION_HASH()->value] = $rightBookmarkCollectionHash;
        }

        $filters[TinderWorkflowParams::PAGE()->value] = $page;

        $preferences = session('tinder_proposal_preferences', []);

        $existingSwipedLeft = $this->getSwipedProposalSlugs($leftBookmarkCollection);
        $existingSwipedRight = $this->getSwipedProposalSlugs($rightBookmarkCollection);

        $proposals = null;
        $selectedFund = null;

        if (! empty($preferences['selectedFund'])) {
            $selectedFund = Fund::find($preferences['selectedFund']);

            if ($selectedFund) {
                // Merge the collection hashes into the request so they can be used in fetchProposals
                $requestWithCollections = new Request(array_merge($request->all(), [
                    TinderWorkflowParams::LEFT_BOOKMARK_COLLECTION_HASH()->value => $leftBookmarkCollectionHash,
                    TinderWorkflowParams::RIGHT_BOOKMARK_COLLECTION_HASH()->value => $rightBookmarkCollectionHash,
                ]));

                $requestWithCollections->setMethod($request->method());
                $requestWithCollections->headers = $request->headers;
                $requestWithCollections->setUserResolver($request->getUserResolver());

                $proposals = $this->fetchProposals($selectedFund, $preferences, $requestWithCollections);
            }
        }

        $isLoadMore = ! empty($validated[TinderWorkflowParams::LOAD_MORE()->value]) && $validated[TinderWorkflowParams::LOAD_MORE()->value] == true;

        $step3Props = [
            'stepDetails' => $this->getStepDetails(),
            'activeStep' => intval($request->step),
            'tinderCollection' => $tinderCollection,
            'collectionHash' => $tinderCollectionHash,
            'collectionId' => $tinderCollectionHash,
            'leftBookmarkCollection' => $leftBookmarkCollection,
            'rightBookmarkCollection' => $rightBookmarkCollection,
            'leftBookmarkCollectionHash' => $leftBookmarkCollectionHash,
            'leftBookmarkCollectionId' => $leftBookmarkCollectionHash,
            'rightBookmarkCollectionHash' => $rightBookmarkCollectionHash,
            'rightBookmarkCollectionId' => $rightBookmarkCollectionHash,
            'proposals' => $proposals,
            'filters' => $filters,
            'selectedFund' => $selectedFund ? [
                'id' => $selectedFund->id,
                'title' => $selectedFund->title,
                'slug' => $selectedFund->slug,
            ] : null,
            'preferences' => $preferences,
            'existingSwipedLeft' => $existingSwipedLeft,
            'existingSwipedRight' => $existingSwipedRight,
            'isLoadMore' => $isLoadMore && $proposals,
        ];

        // additional data for non-load-more requests
        if (! ($isLoadMore && $proposals)) {
            $step3Props = array_merge($step3Props, [
                'savedCurrentIndex' => $savedCurrentIndex,
                'savedTotalSeen' => $savedTotalSeen,
                'startingPage' => $page,
                'currentIndexWithinPage' => (! empty($validated[TinderWorkflowParams::PAGE()->value]) || $savedCurrentPage !== null) ? 0 : ($savedCurrentIndex > 0 ? ($savedCurrentIndex % 20) : 0),
            ]);
        }

        return Inertia::render('Workflows/TinderProposal/Step3', $step3Props);
    }

    public function step4(Request $request): Response
    {
        $validated = $request->validate([
            TinderWorkflowParams::RIGHT_BOOKMARK_COLLECTION_HASH()->value => 'nullable|string',
            TinderWorkflowParams::LEFT_BOOKMARK_COLLECTION_HASH()->value => 'nullable|string',
            TinderWorkflowParams::TINDER_COLLECTION_HASH()->value => 'nullable|string',
        ]);

        $tinderCollectionHash = ! empty($validated[TinderWorkflowParams::TINDER_COLLECTION_HASH()->value]) ? $validated[TinderWorkflowParams::TINDER_COLLECTION_HASH()->value] : null;
        $leftBookmarkCollectionHash = ! empty($validated[TinderWorkflowParams::LEFT_BOOKMARK_COLLECTION_HASH()->value]) ? $validated[TinderWorkflowParams::LEFT_BOOKMARK_COLLECTION_HASH()->value] : null;
        $rightBookmarkCollectionHash = ! empty($validated[TinderWorkflowParams::RIGHT_BOOKMARK_COLLECTION_HASH()->value]) ? $validated[TinderWorkflowParams::RIGHT_BOOKMARK_COLLECTION_HASH()->value] : null;

        $leftBookmarkCollection = null;
        $rightBookmarkCollection = null;
        $leftProposals = collect();
        $rightProposals = collect();

        // Process both bookmark collections using a loop to avoid repetition
        $collections = [
            'left' => ['hash' => $leftBookmarkCollectionHash],
            'right' => ['hash' => $rightBookmarkCollectionHash],
        ];

        foreach ($collections as $key => $collectionData) {
            if ($collectionData['hash']) {
                $collection = BookmarkCollection::find($collectionData['hash']);
                if ($collection) {
                    $collection->loadCount('items');

                    // Load the bookmark items with their proposal relationships
                    $bookmarkItems = $collection->proposals()
                        ->where('model_type', Proposal::class)
                        ->with(['model.fund'])
                        ->get();

                    $proposals = collect();
                    if ($bookmarkItems->isNotEmpty()) {
                        $proposals = $bookmarkItems->map(function ($bookmarkItem) {
                            $proposalData = ProposalData::from($bookmarkItem->model);

                            return [
                                'proposal' => $proposalData,
                                'bookmark_item_hash' => $bookmarkItem->id,
                            ];
                        });
                    }

                    // Assign to the correct variables based on the key
                    if ($key === 'left') {
                        $leftBookmarkCollection = $collection;
                        $leftProposals = $proposals;
                    } else {
                        $rightBookmarkCollection = $collection;
                        $rightProposals = $proposals;
                    }
                }
            }
        }

        return Inertia::render('Workflows/TinderProposal/Step4', [
            'stepDetails' => $this->getStepDetails(),
            'activeStep' => intval($request->step),
            'tinderCollectionHash' => $tinderCollectionHash,
            'leftBookmarkCollection' => $leftBookmarkCollection ? BookmarkCollectionData::from($leftBookmarkCollection) : null,
            'rightBookmarkCollection' => $rightBookmarkCollection ? BookmarkCollectionData::from($rightBookmarkCollection) : null,
            'leftProposals' => $leftProposals,
            'rightProposals' => $rightProposals,
        ]);
    }

    public function saveStep1(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            TinderWorkflowParams::SELECTED_FUND()->value => 'required|string',
            TinderWorkflowParams::PROPOSAL_TYPES()->value => 'array',
            TinderWorkflowParams::PROPOSAL_TYPES()->value.'.*' => 'string',
            TinderWorkflowParams::PROPOSAL_SIZES()->value => 'array',
            TinderWorkflowParams::PROPOSAL_SIZES()->value.'.*' => 'string',
            TinderWorkflowParams::IMPACT_TYPES()->value => 'array',
            TinderWorkflowParams::IMPACT_TYPES()->value.'.*' => 'string',
            TinderWorkflowParams::TINDER_COLLECTION_HASH()->value => 'nullable|string',
            TinderWorkflowParams::LEFT_BOOKMARK_COLLECTION_HASH()->value => 'nullable|string',
            TinderWorkflowParams::RIGHT_BOOKMARK_COLLECTION_HASH()->value => 'nullable|string',
        ]);

        // Convert selectedFund from string to integer and validate it exists
        $fundId = $validated[TinderWorkflowParams::SELECTED_FUND()->value];

        // Store the preferences in session with converted fund ID
        $preferences = [
            'selectedFund' => $fundId,
            'proposalTypes' => $validated[TinderWorkflowParams::PROPOSAL_TYPES()->value] ?? [],
            'proposalSizes' => $validated[TinderWorkflowParams::PROPOSAL_SIZES()->value] ?? [],
            'impactTypes' => $validated[TinderWorkflowParams::IMPACT_TYPES()->value] ?? [],
        ];

        session(['tinder_proposal_preferences' => $preferences]);

        // Check if we have existing collection data (indicates edit mode)
        $existingCollectionId = ! empty($validated[TinderWorkflowParams::TINDER_COLLECTION_HASH()->value]) ? $validated[TinderWorkflowParams::TINDER_COLLECTION_HASH()->value] : null;

        if ($existingCollectionId) {
            // This indicates edit mode - always go to step 2 to allow editing collection details
            return redirect()->route('workflows.tinderProposal.index', [
                TinderWorkflowParams::STEP()->value => 2,
                TinderWorkflowParams::TINDER_COLLECTION_HASH()->value => $validated[TinderWorkflowParams::TINDER_COLLECTION_HASH()->value] ?? null,
                TinderWorkflowParams::LEFT_BOOKMARK_COLLECTION_HASH()->value => $validated[TinderWorkflowParams::LEFT_BOOKMARK_COLLECTION_HASH()->value] ?? null,
                TinderWorkflowParams::RIGHT_BOOKMARK_COLLECTION_HASH()->value => $validated[TinderWorkflowParams::RIGHT_BOOKMARK_COLLECTION_HASH()->value] ?? null,
            ]);
        }

        return redirect()->route('workflows.tinderProposal.index', [
            TinderWorkflowParams::STEP()->value => 2,
            TinderWorkflowParams::TINDER_COLLECTION_HASH()->value => $validated[TinderWorkflowParams::TINDER_COLLECTION_HASH()->value] ?? null,
            TinderWorkflowParams::LEFT_BOOKMARK_COLLECTION_HASH()->value => $validated[TinderWorkflowParams::LEFT_BOOKMARK_COLLECTION_HASH()->value] ?? null,
            TinderWorkflowParams::RIGHT_BOOKMARK_COLLECTION_HASH()->value => $validated[TinderWorkflowParams::RIGHT_BOOKMARK_COLLECTION_HASH()->value] ?? null,
        ]);
    }

    public function saveStep2(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            TinderWorkflowParams::TITLE()->value => 'required|string|max:255',
            TinderWorkflowParams::CONTENT()->value => 'nullable|string',
            TinderWorkflowParams::VISIBILITY()->value => 'nullable|string',
            TinderWorkflowParams::COMMENTS_ENABLED()->value => 'nullable|boolean',
            TinderWorkflowParams::COLOR()->value => 'nullable|string',
            TinderWorkflowParams::STATUS()->value => 'nullable|string',
            TinderWorkflowParams::RIGHT_BOOKMARK_COLLECTION_HASH()->value => 'nullable|string',
            TinderWorkflowParams::LEFT_BOOKMARK_COLLECTION_HASH()->value => 'nullable|string',
            TinderWorkflowParams::TINDER_COLLECTION_HASH()->value => 'nullable|string',
        ]);

        $preferences = session('tinder_proposal_preferences', []);

        if (empty($preferences)) {

            return redirect()->route('workflows.tinderProposal.index', ['step' => 1]);
        }

        $selectedFund = null;
        if (! empty($preferences['selectedFund'])) {

            $selectedFund = Fund::find($preferences['selectedFund']);
        }

        if (! $selectedFund) {
            return redirect()->route('workflows.tinderProposal.index', ['step' => 1]);
        }

        $existingTinderCollectionList = null;

        if (! empty($validated[TinderWorkflowParams::TINDER_COLLECTION_HASH()->value])) {
            $existingTinderCollectionList = TinderCollection::byhash($validated[TinderWorkflowParams::TINDER_COLLECTION_HASH()->value]);
        }

        $tinderCollectionData = [
            'user_id' => $request->user()->id,
            'title' => $validated[TinderWorkflowParams::TITLE()->value],
            'content' => $validated[TinderWorkflowParams::CONTENT()->value],
        ];

        if ($existingTinderCollectionList && $existingTinderCollectionList->user_id === $request->user()->id) {
            $existingTinderCollectionList->update($tinderCollectionData);
            $tinderCollection = $existingTinderCollectionList;
        } else {
            $tinderCollection = TinderCollection::create($tinderCollectionData);
        }

        $leftBookmarkHash = ! empty($validated[TinderWorkflowParams::LEFT_BOOKMARK_COLLECTION_HASH()->value]) ? $validated[TinderWorkflowParams::LEFT_BOOKMARK_COLLECTION_HASH()->value] : null;
        $rightBookmarkHash = ! empty($validated[TinderWorkflowParams::RIGHT_BOOKMARK_COLLECTION_HASH()->value]) ? $validated[TinderWorkflowParams::RIGHT_BOOKMARK_COLLECTION_HASH()->value] : null;

        // Extract common bookmark collection data
        $bookmarkCollectionData = [
            'user_id' => $request->user()->id,
            'title' => $tinderCollection->title,
            'content' => $tinderCollection->content,
            'color' => $validated[TinderWorkflowParams::COLOR()->value],
            'allow_comments' => $validated[TinderWorkflowParams::COMMENTS_ENABLED()->value] ?? false,
            'visibility' => $validated[TinderWorkflowParams::VISIBILITY()->value] ?? 'private',
            'status' => $validated[TinderWorkflowParams::STATUS()->value] ?? BookmarkStatus::DRAFT()->value,
            'fund_id' => $selectedFund->id,
            'model_type' => TinderCollection::class,
            'model_id' => $tinderCollection->id,
        ];

        $leftBookmarkCollection = null;
        $rightBookmarkCollection = null;

        // Handle existing collections
        if ($leftBookmarkHash && $rightBookmarkHash) {
            $leftBookmarkCollection = BookmarkCollection::find($leftBookmarkHash);
            $rightBookmarkCollection = BookmarkCollection::find($rightBookmarkHash);

            if ($leftBookmarkCollection && $leftBookmarkCollection->user_id === $request->user()->id) {
                $leftBookmarkCollection->update($bookmarkCollectionData);
            } else {
                $leftBookmarkCollection = null;
            }

            if ($rightBookmarkCollection && $rightBookmarkCollection->user_id === $request->user()->id) {
                $rightBookmarkCollection->update($bookmarkCollectionData);
            } else {
                $rightBookmarkCollection = null;
            }
        }

        // Create new bookmark collections if they don't exist
        if (! $leftBookmarkCollection) {
            $leftBookmarkCollection = BookmarkCollection::create($bookmarkCollectionData);
        }

        if (! $rightBookmarkCollection) {
            $rightBookmarkCollection = BookmarkCollection::create($bookmarkCollectionData);
        }

        return redirect()->route('workflows.tinderProposal.index', [
            'step' => 3,
            'tinderCollectionHash' => $tinderCollection->id,
            'tinderCollectionId' => $tinderCollection->id,
            'leftBookmarkCollectionHash' => $leftBookmarkCollection->id,
            'leftBookmarkCollectionId' => $leftBookmarkCollection->id,
            'rightBookmarkCollectionHash' => $rightBookmarkCollection->id,
            'rightBookmarkCollectionId' => $rightBookmarkCollection->id,
        ]);
    }

    public function saveStep3(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            TinderWorkflowParams::SWIPED_LEFT_PROPOSALS()->value => 'array',
            TinderWorkflowParams::SWIPED_LEFT_PROPOSALS()->value.'.*' => 'string',
            TinderWorkflowParams::SWIPED_RIGHT_PROPOSALS()->value => 'array',
            TinderWorkflowParams::SWIPED_RIGHT_PROPOSALS()->value.'.*' => 'string',
            TinderWorkflowParams::RIGHT_BOOKMARK_COLLECTION_HASH()->value => 'nullable|string',
            TinderWorkflowParams::LEFT_BOOKMARK_COLLECTION_HASH()->value => 'nullable|string',
            TinderWorkflowParams::TINDER_COLLECTION_HASH()->value => 'nullable|string',
            TinderWorkflowParams::CURRENT_INDEX()->value => 'nullable|integer',
            TinderWorkflowParams::TOTAL_PROPOSALS_SEEN()->value => 'nullable|integer',
            TinderWorkflowParams::PAGE()->value => 'nullable|integer',
        ]);

        $preferences = session('tinder_proposal_preferences', []);
        $tinderCollectionHash = ! empty($validated[TinderWorkflowParams::TINDER_COLLECTION_HASH()->value]) ? $validated[TinderWorkflowParams::TINDER_COLLECTION_HASH()->value] : null;
        $leftBookmarkCollectionHash = ! empty($validated[TinderWorkflowParams::LEFT_BOOKMARK_COLLECTION_HASH()->value]) ? $validated[TinderWorkflowParams::LEFT_BOOKMARK_COLLECTION_HASH()->value] : null;
        $rightBookmarkCollectionHash = ! empty($validated[TinderWorkflowParams::RIGHT_BOOKMARK_COLLECTION_HASH()->value]) ? $validated[TinderWorkflowParams::RIGHT_BOOKMARK_COLLECTION_HASH()->value] : null;

        if (isset($validated[TinderWorkflowParams::CURRENT_INDEX()->value])) {
            session(['tinder_proposal_current_index' => $validated[TinderWorkflowParams::CURRENT_INDEX()->value]]);
        }
        if (isset($validated[TinderWorkflowParams::TOTAL_PROPOSALS_SEEN()->value])) {
            session(['tinder_proposal_total_seen' => $validated[TinderWorkflowParams::TOTAL_PROPOSALS_SEEN()->value]]);
        }
        if (isset($validated[TinderWorkflowParams::PAGE()->value])) {
            session(['tinder_proposal_current_page' => $validated[TinderWorkflowParams::PAGE()->value]]);
        }

        $tinderCollection = null;
        if ($tinderCollectionHash) {
            $tinderCollection = TinderCollection::find($tinderCollectionHash);
        }

        if (! $tinderCollection) {
            return redirect()->route('workflows.tinderProposal.index', ['step' => 2]);
        }

        $selectedFund = null;
        if (! empty($preferences['selectedFund'])) {
            $selectedFund = Fund::find($preferences['selectedFund']);
        }

        if (! $selectedFund) {
            return redirect()->route('workflows.tinderProposal.index', ['step' => 1]);
        }

        $leftBookmarkCollection = null;
        $rightBookmarkCollection = null;

        if ($leftBookmarkCollectionHash) {
            $leftBookmarkCollection = BookmarkCollection::find($leftBookmarkCollectionHash);

            if ($leftBookmarkCollection && $leftBookmarkCollection->user_id !== $request->user()->id) {
                $leftBookmarkCollection = null;
            }
        }

        if ($rightBookmarkCollectionHash) {
            $rightBookmarkCollection = BookmarkCollection::find($rightBookmarkCollectionHash);

            if ($rightBookmarkCollection && $rightBookmarkCollection->user_id !== $request->user()->id) {
                $rightBookmarkCollection = null;
            }
        }

        // Create missing bookmark collections if they don't exist or were deleted
        $bookmarkCollectionData = [
            'user_id' => $request->user()->id,
            'title' => $tinderCollection->title,
            'content' => $tinderCollection->content,
            'color' => '#2596BE',
            'allow_comments' => false,
            'visibility' => 'private',
            'status' => BookmarkStatus::DRAFT()->value,
            'fund_id' => $selectedFund->id,
            'model_type' => TinderCollection::class,
            'model_id' => $tinderCollection->id,
        ];

        if (! $leftBookmarkCollection) {
            $leftBookmarkCollection = BookmarkCollection::create($bookmarkCollectionData);
        }

        if (! $rightBookmarkCollection) {
            $rightBookmarkCollection = BookmarkCollection::create($bookmarkCollectionData);
        }

        // Get already existing proposal slugs in both collections to avoid duplicates
        $existingLeftSlugs = $this->getSwipedProposalSlugs($leftBookmarkCollection);
        $existingRightSlugs = $this->getSwipedProposalSlugs($rightBookmarkCollection);

        // Save only new left swiped proposals to the rejected bookmark collection
        $newLeftSlugs = array_diff($validated['swipedLeftProposals'] ?? [], $existingLeftSlugs);
        if (! empty($newLeftSlugs)) {
            $leftProposals = Proposal::whereIn('slug', $newLeftSlugs)->get();

            foreach ($leftProposals as $proposal) {
                DB::table('bookmark_items')->insert([
                    'bookmark_collection_id' => $leftBookmarkCollection->id,
                    'user_id' => $request->user()->id,
                    'model_type' => Proposal::class,
                    'model_id' => $proposal->id,
                    'vote' => VoteEnum::NO->value,
                    'created_at' => now(),
                    'updated_at' => now(),
                ]);
            }
        }

        // Save only new right swiped proposals to the liked bookmark collection
        $newRightSlugs = array_diff($validated['swipedRightProposals'] ?? [], $existingRightSlugs);
        if (! empty($newRightSlugs)) {
            $rightProposals = Proposal::whereIn('slug', $newRightSlugs)->get();

            foreach ($rightProposals as $proposal) {
                DB::table('bookmark_items')->insert([
                    'bookmark_collection_id' => $rightBookmarkCollection->id,
                    'user_id' => $request->user()->id,
                    'model_type' => Proposal::class,
                    'model_id' => $proposal->id,
                    'vote' => VoteEnum::YES->value,
                    'created_at' => now(),
                    'updated_at' => now(),
                ]);
            }
        }

        return redirect()->route('workflows.tinderProposal.index', [
            'step' => 4,
            'tinderCollectionHash' => $tinderCollection->id,
            'leftBookmarkCollectionHash' => $leftBookmarkCollection->id,
            'rightBookmarkCollectionHash' => $rightBookmarkCollection->id,
        ]);
    }

    /**
     * Fetch proposals from Meilisearch based on fund and user preferences
     */
    private function fetchProposals(Fund $fund, array $preferences, Request $request): ?LengthAwarePaginator
    {
        $page = $request->input(TinderWorkflowParams::PAGE()->value, 1);
        $limit = $request->input('limit', 20);
        $search = '';

        $filters = [];
        $filters[] = "fund.id = {$fund->id}";

        $currentIndex = session('tinder_proposal_current_index', 0);
        $isInitialLoad = $request->input(TinderWorkflowParams::LOAD_MORE()->value) !== '1';
        $isLoadMore = $request->input(TinderWorkflowParams::LOAD_MORE()->value) === '1';

        // For load more, use the page from the request
        if ($isInitialLoad && $currentIndex > 0) {
            // Don't modify the page - it's already calculated in step3() method
            $actualOffset = ($page - 1) * $limit;
        } elseif ($isLoadMore) {
            // For load more, use standard pagination
            $actualOffset = ($page - 1) * $limit;
        } else {
            // Fresh start
            $actualOffset = 0;
        }

        if ($isInitialLoad) {
            $existingProposalIds = $this->getExistingBookmarkedProposalIds($request);
            if (! empty($existingProposalIds)) {
                $excludeFilter = 'id NOT IN ['.implode(', ', $existingProposalIds).']';
                $filters[] = $excludeFilter;
            }
        }

        if (! empty($preferences[TinderWorkflowParams::PROPOSAL_TYPES()->value] ?? [])) {
            $hashes = array_map(
                fn ($h) => "\"{$h}\"",
                $preferences[TinderWorkflowParams::PROPOSAL_TYPES()->value]
            );
            $filters[] = 'campaign.hash IN ['.implode(',', $hashes).']';
        }

        if (! empty($preferences[TinderWorkflowParams::PROPOSAL_SIZES()->value] ?? [])) {
            $sizeFilters = [];

            foreach ($preferences[TinderWorkflowParams::PROPOSAL_SIZES()->value] as $size) {

                switch ($size) {
                    case 'small-scale':
                        $sizeFilters[] = 'amount_requested <= 75000';
                        break;
                    case 'mid-size':
                        $sizeFilters[] = 'amount_requested > 75000 AND amount_requested <= 110000';
                        break;
                    case 'large-scale':
                        $sizeFilters[] = 'amount_requested > 110000';
                        break;
                    default:
                }
            }

            if (! empty($sizeFilters)) {
                $filters[] = '('.implode(' OR ', $sizeFilters).')';
            }
        }

        $args = [
            'filter' => $filters,
            'limit' => $limit,
            'offset' => $actualOffset,
            'sort' => ['ranking_total:desc'],
        ];

        $repository = app(ProposalRepository::class);
        $searchBuilder = $repository->search($search, $args);

        $response = new Fluent($searchBuilder->raw());

        $proposals = new LengthAwarePaginator(
            ProposalData::collect(collect($response->hits)->toArray()),
            $response->estimatedTotalHits,
            $limit,
            $page,
            [
                'path' => $request->url(),
                'pageName' => 'p',
            ]
        );

        return $proposals;
    }

    /**
     * Fetch more proposals for infinite swiping
     */
    public function fetchMoreProposals(Request $request)
    {
        // Get stored preferences from session
        $preferences = session('tinder_proposal_preferences', []);

        if (empty($preferences['selectedFund'])) {
            return response()->json(['error' => 'No fund selected'], 400);
        }

        $selectedFund = Fund::find($preferences['selectedFund']);

        if (! $selectedFund) {
            return response()->json(['error' => 'Fund not found'], 404);
        }

        $validated = $request->validate([
            TinderWorkflowParams::LEFT_BOOKMARK_COLLECTION_HASH()->value => 'nullable|string',
            TinderWorkflowParams::RIGHT_BOOKMARK_COLLECTION_HASH()->value => 'nullable|string',
        ]);

        $requestWithCollections = new Request(array_merge($request->all(), [
            TinderWorkflowParams::LEFT_BOOKMARK_COLLECTION_HASH()->value => $validated[TinderWorkflowParams::LEFT_BOOKMARK_COLLECTION_HASH()->value],
            TinderWorkflowParams::RIGHT_BOOKMARK_COLLECTION_HASH()->value => $validated[TinderWorkflowParams::RIGHT_BOOKMARK_COLLECTION_HASH()->value],
        ]));

        $requestWithCollections->setMethod($request->method());
        $requestWithCollections->headers = $request->headers;
        $requestWithCollections->setUserResolver($request->getUserResolver());

        $proposals = $this->fetchProposals($selectedFund, $preferences, $requestWithCollections);

        if ($proposals === null) {
            return response()->json(['error' => 'Failed to fetch proposals'], 500);
        }

        return response()->json([
            'proposals' => $proposals->items(),
            'pagination' => [
                'current_page' => $proposals->currentPage(),
                'last_page' => $proposals->lastPage(),
                'per_page' => $proposals->perPage(),
                'total' => $proposals->total(),
                'has_more_pages' => $proposals->hasMorePages(),
            ],
        ]);
    }

    /**
     * Fetch proposals for a specific bookmark collection
     */
    public function fetchCollectionProposals(Request $request)
    {
        $validated = $request->validate([
            'collectionHash' => 'required|string',
        ]);

        $bookmarkCollection = BookmarkCollection::find($validated['collectionHash']);

        if (! $bookmarkCollection || $bookmarkCollection->user_id !== $request->user()->id) {
            return response()->json(['error' => 'Collection not found or unauthorized'], 404);
        }

        // Get proposals from the bookmark collection with proper relationships
        $proposals = $bookmarkCollection->proposals()
            ->with(['model.fund', 'model.users', 'model.author'])
            ->get()
            ->map(function ($bookmarkItem) {
                return ProposalData::from($bookmarkItem->model);
            });

        return response()->json([
            'proposals' => $proposals,
            'collection' => BookmarkCollectionData::from($bookmarkCollection),
        ]);
    }

    /**
     * Get proposal slugs that are already in a bookmark collection
     */
    private function getSwipedProposalSlugs($bookmarkCollection): array
    {
        if (! $bookmarkCollection) {
            return [];
        }

        return DB::table('bookmark_items')
            ->join('proposals', 'bookmark_items.model_id', '=', 'proposals.id')
            ->where('bookmark_items.bookmark_collection_id', $bookmarkCollection->id)
            ->where('bookmark_items.model_type', Proposal::class)
            ->pluck('proposals.slug')
            ->toArray();
    }

    /**
     * Get proposal IDs that are already in the current session's bookmark collections
     */
    private function getExistingBookmarkedProposalIds(Request $request): array
    {
        $proposalIds = [];

        $leftBookmarkHash = $request->input(TinderWorkflowParams::LEFT_BOOKMARK_COLLECTION_HASH()->value);
        $rightBookmarkHash = $request->input(TinderWorkflowParams::RIGHT_BOOKMARK_COLLECTION_HASH()->value);

        $collectionIds = [];

        if ($leftBookmarkHash) {
            $leftBookmarkCollection = BookmarkCollection::find($leftBookmarkHash);
            if ($leftBookmarkCollection && $leftBookmarkCollection->user_id === $request->user()->id) {
                $collectionIds[] = $leftBookmarkCollection->id;
            }
        }

        if ($rightBookmarkHash) {
            $rightBookmarkCollection = BookmarkCollection::find($rightBookmarkHash);
            if ($rightBookmarkCollection && $rightBookmarkCollection->user_id === $request->user()->id) {
                $collectionIds[] = $rightBookmarkCollection->id;
            }
        }

        if (! empty($collectionIds)) {
            $proposalIds = DB::table('bookmark_items')
                ->whereIn('bookmark_collection_id', $collectionIds)
                ->where('model_type', Proposal::class)
                ->where('user_id', $request->user()->id)
                ->pluck('model_id')
                ->toArray();
        }

        return $proposalIds;
    }

    /**
     * Get step2 data from collections in priority order: left -> right -> tinder -> session
     */
    private function getStep2DataFromCollections($leftBookmarkCollection, $rightBookmarkCollection, $tinderCollection, Request $request): array
    {
        if ($leftBookmarkCollection) {
            return [
                'title' => $leftBookmarkCollection->title,
                'content' => $leftBookmarkCollection->content,
                'visibility' => $leftBookmarkCollection->visibility,
                'comments_enabled' => $leftBookmarkCollection->allow_comments,
                'color' => $leftBookmarkCollection->color,
                'status' => $leftBookmarkCollection->status,
            ];
        }

        if ($rightBookmarkCollection) {
            return [
                'title' => $rightBookmarkCollection->title,
                'content' => $rightBookmarkCollection->content,
                'visibility' => $rightBookmarkCollection->visibility,
                'comments_enabled' => $rightBookmarkCollection->allow_comments,
                'color' => $rightBookmarkCollection->color,
                'status' => $rightBookmarkCollection->status,
            ];
        }

        if ($tinderCollection) {
            return [
                'title' => $tinderCollection->title,
                'content' => $tinderCollection->content,
                'visibility' => 'unlisted',
                'comments_enabled' => false,
                'color' => '#2596BE',
                'status' => 'draft',
            ];
        }

        return [];
    }

    public function addBookmarkItem(Request $request)
    {
        $validated = $request->validate([
            'proposalSlug' => 'required|string',
            'modelType' => 'required|string',
            'bookmarkCollection' => 'required|string',
            'vote' => 'nullable|integer|in:-1,0,1', // Accept VoteEnum values
        ]);

        $bookmarkCollection = BookmarkCollection::find($validated['bookmarkCollection']);

        if (! $bookmarkCollection || $bookmarkCollection->user_id !== Auth::id()) {

            return response()->json(['error' => 'Bookmark collection not found or access denied.'], 404);
        }

        $proposal = Proposal::where('slug', $validated['proposalSlug'])->first();

        if (! $proposal) {
            return response()->json(['error' => 'Proposal not found.'], 404);
        }

        $proposal = Proposal::where('slug', $validated['proposalSlug'])->first();

        if (! $proposal) {
            return response()->json(['error' => 'Proposal not found.'], 404);
        }

        $bookmarkableType = BookmarkableType::tryFrom(Str::kebab($validated['modelType']))->getModelClass();

        BookmarkItem::updateOrCreate([
            'user_id' => Auth::id(),
            'bookmark_collection_id' => $bookmarkCollection->id,
            'model_id' => $proposal->id,
            'model_type' => $bookmarkableType,
        ], [
            'title' => null,
            'content' => null,
            'action' => null,
            'vote' => isset($validated['vote']) ? $validated['vote'] : null,
        ]);

        $bookmarkCollection->searchable();

        return response()->json(['success' => 'Proposal added to collection successfully.']);
    }

    private function getStepDetails(): array
    {
        return [
            [
                'title' => 'workflows.tinderProposal.stepDetails.getStarted',
            ],
            [
                'title' => 'workflows.tinderProposal.stepDetails.createList',
            ],
            [
                'title' => 'workflows.tinderProposal.stepDetails.exploreIdeas',
            ],
            [
                'title' => 'workflows.tinderProposal.stepDetails.mySwipeList',
            ],
        ];
    }
}

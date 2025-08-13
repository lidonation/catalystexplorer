<?php

declare(strict_types=1);

namespace App\Http\Controllers;

use App\DataTransferObjects\IdeascaleProfileData;
use App\DataTransferObjects\ProposalData;
use App\Enums\CatalystCurrencySymbols;
use App\Enums\NftStatusEnum;
use App\Enums\ProposalSearchParams;
use App\Enums\ProposalStatus;
use App\Jobs\UpdateNMKRNftStatus;
use App\Models\IdeascaleProfile;
use App\Models\Nft;
use App\Models\Proposal;
use App\Models\User;
use App\Repositories\ProposalRepository;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Pagination\LengthAwarePaginator;
use Illuminate\Support\Collection;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Fluent;
use Inertia\Inertia;
use Inertia\Response;

class CompletedProjectNftsController extends Controller
{
    protected int $currentPage = 1;

    protected int $limit = 3;

    protected array $queryParams = [];

    protected ?string $sortBy = 'created_at';

    protected ?string $sortOrder = 'desc';

    protected ?string $search = null;

    protected array $claimedIdeascaleProfiles = [];

    protected ?User $user;

    /**
     * Display the user's profile form.
     */
    public function __construct()
    {
        $this->user = Auth::user();
    }

    public function handleStep(Request $request, $step)
    {
        $method = "step{$step}";

        if (method_exists($this, $method)) {
            return $this->$method($request);
        }

        abort(404, "Step '{$step}' not found.");
    }

    public function getStepDetails(): Collection
    {
        return collect([
            [
                'title' => 'workflows.completedProjectNfts.selectProfile',
                'info' => 'workflows.completedProjectNfts.selectProfileInfo',
            ],
            [
                'title' => 'workflows.completedProjectNfts.selectProposal',
                'info' => 'workflows.completedProjectNfts.selectProposalInfo',
            ],
        ]);
    }

    public function step1(Request $request): Response
    {
        return Inertia::render('Workflows/CompletedProjectNfts/Step1', [
            'profiles' => IdeascaleProfileData::collect(IdeascaleProfile::where('claimed_by_id', $this->user->id)
                ->withCount(['proposals'])
                ->get()),
            'stepDetails' => $this->getStepDetails(),
            'activeStep' => intval($request->step),
        ]);
    }

    public function step2(Request $request): Response
    {
        $this->getProps($request);
        $proposals = $this->getClaimedIdeascaleProfilesProposals($request);

        return Inertia::render('Workflows/CompletedProjectNfts/Step2', [
            'proposals' => $proposals,
            'filters' => $this->queryParams,
            'profiles' => $request->profiles,
            'stepDetails' => $this->getStepDetails(),
            'activeStep' => intval($request->step),
        ]);
    }

    public function index(Request $request): Response
    {
        $amountDistributedAda = Proposal::whereHas('fund', function ($query) {
            $query->where('currency', CatalystCurrencySymbols::ADA->name);
        })->sum('amount_received');

        $amountDistributedUsd = Proposal::whereHas('fund', function ($query) {
            $query->where('currency', CatalystCurrencySymbols::USD->name);
        })->sum('amount_received');

        $completedProposalsCount = Proposal::where('status', ProposalStatus::complete()->value)
            ->count();

        $membersFunded = IdeaScaleProfile::whereHas('proposals', function ($query) {
            $query->whereNotNull('funded_at');
        })->count();

        $amountDistributedAda = Proposal::whereHas('fund', function ($query) {
            $query->where('currency', CatalystCurrencySymbols::ADA->name);
        })->sum('amount_received');

        $amountDistributedUsd = Proposal::whereHas('fund', function ($query) {
            $query->where('currency', CatalystCurrencySymbols::USD->name);
        })->sum('amount_received');

        $completedProposalsCount = Proposal::where('status', ProposalStatus::complete()->value)
            ->count();

        $membersFunded = IdeaScaleProfile::whereHas('proposals', function ($query) {
            $query->whereNotNull('funded_at');
        })->count();

        $mintedNfts = Nft::where('status', NftStatusEnum::minted()->value)
            ->get();

        return Inertia::render('CompletedProjectNfts/Index', [
            'amountDistributedAda' => $amountDistributedAda,
            'amountDistributedUsd' => $amountDistributedUsd,
            'completedProposalsCount' => $completedProposalsCount,
            'communityMembersFunded' => $membersFunded,
            'mintedNfts' => $mintedNfts,
        ]);
    }

    /**
     * Display a proposal.
     */
    public function show(Request $request, Proposal $proposal): Response|RedirectResponse
    {
        if ($proposal->status !== ProposalStatus::complete()->value) {
            return back()->withErrors([
                'error' => 'This proposal is not completed yet.',
            ]);
        }

        $user = $this->user;
        $isOwner = false;
        $metadata = null;

        $ideascaleProfile = $proposal->author()->first();

        if (empty($ideascaleProfile)) {
            return back()->withErrors([
                'error' => 'No profile found for this proposal',
            ]);
        }

        // Check if user is the owner of a claimed profile associated with this proposal
        $claimedProfile = null;
        if (! empty($user)) {
            $claimedProfile = $proposal->ideascaleProfiles()
                ->where('claimed_by_id', $user->id)
                ->first();

            $isOwner = ! empty($claimedProfile);
        }

        // Set the correct ideascale profile to use (claimed profile if owner, author otherwise)
        if ($isOwner) {
            $ideascaleProfile = $claimedProfile;
        }

        // Get contributor profiles (excluding the main profile)
        $contributorProfiles = $proposal->ideascaleProfiles
            ->filter(function ($profile) use ($ideascaleProfile) {
                return $profile->id !== $ideascaleProfile->id;
            })
            ->values()
            ->toArray();

        // Look for the NFT associated with this profile and proposal
        $nft = $ideascaleProfile->nfts()
            ->whereJsonContains('metadata->Project Title', $proposal->title)
            ->first();

        // Get NFT metadata if NFT exists
        $artist = null;
        if ($nft) {
            try {
                $metadata = $nft->required_nft_metadata;
                $artist = $nft->artist()->first();
            } catch (\Throwable $th) {
                Log::warning('Failed to get NFT metadata: '.$th->getMessage(), [
                    'nft_id' => $nft->id,
                    'proposal_id' => $proposal->id,
                ]);
                $metadata = [
                    'paymentGatewayLinkForSpecificSale' => null,
                    'state' => null,
                    'policyid' => null,
                    'assetname' => null,
                    'fingerprint' => null,
                    'reserveduntil' => null,
                ];
            }
        } else {
            $metadata = [
                'paymentGatewayLinkForSpecificSale' => null,
                'state' => null,
                'policyid' => null,
                'assetname' => null,
                'fingerprint' => null,
                'reserveduntil' => null,
            ];
        }

        $nftData = null;
        if ($nft) {
            $nftData = [
                ...$nft->toArray(),
                'hash' => $nft->hash,
            ];
        }

        return Inertia::render('CompletedProjectNfts/Partials/Show', [
            'proposal' => $proposal,
            'contributorProfiles' => $contributorProfiles,
            'claimedProfile' => $claimedProfile,
            'author' => $ideascaleProfile,
            'nft' => $nftData,
            'metadata' => $metadata,
            'artist' => $artist,
            'isOwner' => $isOwner,
        ]);
    }

    public function getClaimedIdeascaleProfilesProposals(Request $request): array
    {
        $profileIds = array_filter((array) ($request->profiles ?? []));

        $searchTerm = request('search');

        // get minted nft for the selected profiles
        $mintedNfts = Nft::whereIn('model_id', $profileIds)->where('status', NftStatusEnum::minted()->value)
            ->select('metadata', 'fingerprint')
            ->get();

        $args = [];

        $page = 1;

        $limit = 10;

        $claimedIdeascaleIdsString = implode(',', $profileIds);
        $filter = "users.id IN [{$claimedIdeascaleIdsString}] AND status = '".ProposalStatus::complete()->value."'";

        $args['filter'] = $filter;

        if ((bool) $this->sortBy && (bool) $this->sortOrder) {
            $args['sort'] = ["$this->sortBy:$this->sortOrder"];
        }

        if (isset($this->queryParams[ProposalSearchParams::PAGE()->value])) {
            $page = (int) $this->queryParams[ProposalSearchParams::PAGE()->value];
        }

        if (isset($this->queryParams[ProposalSearchParams::LIMIT()->value])) {
            $limit = (int) $this->queryParams[ProposalSearchParams::LIMIT()->value];
        }

        $args['offset'] = ($page - 1) * $limit;
        $args['limit'] = $limit;

        $proposalRepository = app(ProposalRepository::class);

        $builder = $proposalRepository->search(
            $searchTerm ?? '',
            $args
        );

        $response = new Fluent(attributes: $builder->raw());

        $items = collect($response->hits);

        if (! empty($mintedNfts)) {
            $items = $this->mapProposalToNFt($mintedNfts, $items);
        }

        $pagination = new LengthAwarePaginator(
            ProposalData::collect(
                $items->toArray()
            ),
            $response->estimatedTotalHits,
            $limit,
            $page,
            [
                'pageName' => 'p',
                'onEachSide' => 1,
            ]
        );

        return $pagination->toArray();
    }

    protected function mapProposalToNFt(Collection $nfts, Collection $proposals): Collection
    {
        $nftIndex = [];

        foreach ($nfts as $nft) {
            $metadata = $nft->metadata;
            $title = $metadata['Project Title'] ?? null;

            if ($title) {
                $nftIndex[$title][] =
                    $nft['fingerprint'];
            }
        }

        return $proposals->map(function ($proposal) use ($nftIndex) {
            $title = $proposal['title'];

            if (isset($nftIndex[$title])) {
                $proposal['minted_nfts_fingerprint'] = $nftIndex[$title] ?? [];
            }

            return $proposal;
        });
    }

    protected function getProps(Request $request): void
    {
        $this->queryParams = $request->validate([
            ProposalSearchParams::QUERY()->value => 'string|nullable',
            ProposalSearchParams::PAGE()->value => 'int|nullable',
            ProposalSearchParams::LIMIT()->value => 'int|nullable',
            ProposalSearchParams::SORTS()->value => 'nullable',
        ]);

        if (! empty($this->queryParams[ProposalSearchParams::SORTS()->value])) {
            $sort = collect(
                explode(
                    ':',
                    $this->queryParams[ProposalSearchParams::SORTS()->value]
                )
            )->filter();

            $this->sortBy = $sort->first();

            $this->sortOrder = $sort->last();
        }
    }

    public function getClaimedIdeascaleProfiles(): array
    {
        $page = 1;

        $limit = 3;

        $user = $this->user;

        if ($user) {
            $this->claimedIdeascaleProfiles = IdeascaleProfile::where('claimed_by_id', $user->id)
                ->withCount(['proposals'])
                ->get()
                ->toArray();
        }

        $pagination = new LengthAwarePaginator(
            IdeascaleProfileData::collect($this->claimedIdeascaleProfiles),
            $limit,
            $page,
            options: [
                'pageName' => 'p',
            ]
        );

        return $pagination->onEachSide(1)->toArray();
    }

    /**
     * Update NFT metadata.
     */
    public function updateMetadata(Nft $nft, Request $request): RedirectResponse
    {
        $request->validate([
            'remove' => 'boolean',
            'meta' => 'required|array',
            'meta.key' => 'required|string',
            'meta.value' => 'nullable',
        ]);

        try {
            $nft->load('metas');

            $key = $request->input('meta.key');
            $value = $request->input('meta.value');
            $shouldRemove = $request->boolean('remove');

            $keyMap = [
                'campaignName' => 'projectCatalystCampaignName',
                'projectNumber' => 'fundedProjectNumber',
                'projectTitle' => 'projectTitle',
                'yesVotes' => 'yesVotes',
                'noVotes' => 'noVotes',
                'role' => 'role',
            ];
            $metadataKey = $keyMap[$key] ?? $key;

            $nmkrMeta = $nft->metas->where('key', 'nmkr_metadata')->first();

            if (! $nmkrMeta) {
                Log::error('UpdateMetadata NO NMKR META FOUND', [
                    'all_metas' => $nft->metas->map(function ($meta) {
                        return [
                            'id' => $meta->id,
                            'key' => $meta->key,
                            'model_type' => $meta->model_type,
                            'model_id' => $meta->model_id,
                        ];
                    })->toArray(),
                ]);
                throw new \Exception('No NMKR metadata found');
            }

            $metadata = json_decode($nmkrMeta->content, true);
            if (! $metadata || ! isset($metadata['721'])) {
                throw new \Exception('Invalid metadata format');
            }

            $policyId = null;
            $assetName = null;
            foreach ($metadata['721'] as $pid => $policyData) {
                if ($pid !== 'version' && is_array($policyData)) {
                    $policyId = $pid;
                    $assetName = array_key_first($policyData);
                    break;
                }
            }

            if (! $policyId || ! $assetName) {
                throw new \Exception('Could not find asset in metadata');
            }

            if ($shouldRemove) {
                unset($metadata['721'][$policyId][$assetName][$metadataKey]);
            } else {
                $metadata['721'][$policyId][$assetName][$metadataKey] = (string) $value;
            }

            $isProduction = $nft->status === 'minted' &&
                        $nft->minted_at &&
                        ! str_contains($policyId, 'test');

            if ($isProduction) {
                $response = $nft->updateNMKRNft($metadata);
                if (! $response->successful()) {
                    Log::warning('NMKR API failed, updating locally only', [
                        'nft_id' => $nft->id,
                        'status' => $response->status(),
                    ]);
                }
            }

            $nmkrMeta->content = json_encode($metadata);
            $nmkrMeta->save();

            $this->updateMainMetadata($nft, $metadataKey, $value, $shouldRemove);

            return back()->with([
                'success' => true,
                'is_removed' => $shouldRemove,
                'key' => $key,
            ]);

        } catch (\Throwable $e) {
            Log::error('Metadata update failed: '.$e->getMessage(), [
                'nft_id' => $nft->id,
                'key' => $request->input('meta.key'),
                'exception' => $e->getTraceAsString(),
            ]);

            return back()->withErrors([
                'error' => 'Failed to update: '.$e->getMessage(),
            ]);
        }
    }

    /**
     * Update the main metadata field
     */
    private function updateMainMetadata(Nft $nft, string $nmkrKey, $value, bool $remove): void
    {
        $localKeys = [
            'projectCatalystCampaignName' => 'campaign_name',
            'fundedProjectNumber' => 'Funded Project Number',
            'projectTitle' => 'Project Title',
            'yesVotes' => 'yes_votes',
            'noVotes' => 'no_votes',
            'role' => 'role',
        ];

        $localKey = $localKeys[$nmkrKey] ?? $nmkrKey;

        $metadata = is_string($nft->metadata)
            ? json_decode($nft->metadata, true) ?: []
            : (array) $nft->metadata;

        if ($remove) {
            unset($metadata[$localKey]);
        } else {
            $metadata[$localKey] = (string) $value;
        }

        $nft->metadata = $metadata;
        $nft->save();
    }

    /**
     * Get specific NFT details.
     */
    public function getNftDetails(Nft $nft): JsonResponse
    {
        try {
            // First try to get NMKR metadata from API
            $response = $nft->getNMKRNftMetadata();
            $nftData = $response->json();

            if ($nftData) {
                // Extract only the required fields
                return response()->json([
                    'paymentGatewayLinkForSpecificSale' => $nftData['paymentGatewayLinkForSpecificSale'] ?? null,
                    'state' => $nftData['state'] ?? null,
                    'policyid' => $nftData['policyid'] ?? null,
                    'assetname' => $nftData['assetname'] ?? null,
                    'fingerprint' => $nftData['fingerprint'] ?? null, // Added fingerprint in case it's needed for viewing
                ]);
            }

            // Fall back to database metadata if API fails
            if (isset($nft->metadata) && is_array($nft->metadata)) {
                return response()->json([
                    'paymentGatewayLinkForSpecificSale' => $nft->maker_nft_uuid
                        ? "https://pay.preprod.nmkr.io/?p={$nft->maker_project_uuid}&n={$nft->maker_nft_uuid}"
                        : null,
                    'state' => $nft->minted_at ? 'sold' : 'free',
                    'policyid' => $nft->policy ?? null,
                    'assetname' => $nft->metadata['assetname'] ?? null,
                    'fingerprint' => $nft->metadata['fingerprint'] ?? null,
                ]);
            }

            return response()->json(null);
        } catch (\Throwable $th) {
            Log::error('Error Getting NFT Details: '.$th->getMessage(), [
                'nft_id' => $nft->id,
                'exception' => $th,
            ]);

            // Return null instead of error for better UI handling
            return response()->json(null);
        }
    }

    public function updateNftMintStatus(Request $request)
    {
        try {
            $payload = $request->input();

            Log::info('NMKR-webhook Payload:', $payload, true);

            UpdateNMKRNftStatus::dispatch($payload);

            return response()->json(['message' => 'Webhook processed successfully'], 200);
        } catch (\Exception $e) {
            Log::error('Error processing NMKR-webhook:', ['error' => $e->getMessage()]);
        }
    }
}

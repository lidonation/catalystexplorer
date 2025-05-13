<?php

declare(strict_types=1);

namespace App\Http\Controllers;

use App\Actions\TransformHashToIds;
use App\Actions\TransformIdsToHashes;
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
            ->get(['name', 'description', 'preview_link'])
            ->map(function ($nft) {
                return [
                    'name' => $nft->name,
                    'description' => $nft->description,
                    'preview_link' => $nft->preview_link,
                ];
            });

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

        return Inertia::render('CompletedProjectNfts/Partials/Show', [
            'proposal' => $proposal,
            'contributorProfiles' => $contributorProfiles,
            'claimedProfile' => $claimedProfile,
            'author' => $ideascaleProfile,
            'nft' => [
                ...$nft->toArray(),
                'hash' => $nft->hash
            ],
            'metadata' => $metadata,
            'artist' => $artist,
            'isOwner' => $isOwner,
        ]);
    }

    public function getClaimedIdeascaleProfilesProposals(Request $request): array
    {
        $profileIds = (new TransformHashToIds)(collect($request->profiles), new IdeascaleProfile);
        $searchTerm = request('search');

        $user = $this->user;

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

        $pagination = new LengthAwarePaginator(
            ProposalData::collect(
                (new TransformIdsToHashes)(
                    collection: $items,
                    model: new Proposal
                )->toArray()
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
        $validatedData = $request->validate([
            'remove' => 'boolean',
            'meta' => 'required|array',
            'meta.key' => 'required|string',
            'meta.value' => 'nullable',
        ]);

        try {
            // Get the key and value from the request
            $key = $request->input('meta.key');
            $value = $request->input('meta.value');
            $shouldRemove = $request->boolean('remove');

            // Map frontend key names to metadata keys for the NMKR API
            $metadataKeyMap = [
                'campaignName' => 'projectCatalystCampaignName',
                'projectNumber' => 'fundedProjectNumber',
                'projectTitle' => 'projectTitle',
                'yesVotes' => 'yesVotes',
                'noVotes' => 'noVotes',
                'role' => 'role',
            ];

            $metadataKey = $metadataKeyMap[$key] ?? $key;

            $nmkrMetadata = $nft->metas->where('key', 'nmkr_metadata')->first();

            if (! $nmkrMetadata) {
                throw new \Exception('No NMKR metadata found for this NFT');
            }

            $currentMetadata = json_decode($nmkrMetadata->content, true);
            if (json_last_error() !== JSON_ERROR_NONE) {
                throw new \Exception('Invalid JSON in NMKR metadata: '.json_last_error_msg());
            }

            if (! isset($currentMetadata['721'])) {
                throw new \Exception('Invalid NMKR metadata format: Missing 721 field');
            }

            $policyId = array_key_first($currentMetadata['721']);
            if (! $policyId || $policyId === 'version') {
                throw new \Exception('Invalid NMKR metadata format: No valid policy ID found');
            }

            if (isset($currentMetadata['721']['version'])) {
                $version = $currentMetadata['721']['version'];
                unset($currentMetadata['721']['version']);
            }

            $assetKeys = array_filter(array_keys($currentMetadata['721'][$policyId]), function ($key) {
                return $key !== 'version';
            });

            if (empty($assetKeys)) {
                throw new \Exception('Invalid NMKR metadata format: No asset names found');
            }

            $assetName = $assetKeys[0];
            $assetMetadata = $currentMetadata['721'][$policyId][$assetName];

            if ($shouldRemove) {
                if (isset($assetMetadata[$metadataKey])) {
                    unset($assetMetadata[$metadataKey]);
                }
            } else {
                $assetMetadata[$metadataKey] = (string) $value;
            }

            $currentMetadata['721'][$policyId][$assetName] = $assetMetadata;

            if (isset($version)) {
                $currentMetadata['721']['version'] = $version;
            }

            $response = $nft->updateNMKRNft($currentMetadata);

            if ($response->successful()) {
                $nmkrMetadata->content = json_encode($currentMetadata);
                $nmkrMetadata->save();

                if (property_exists($nft, 'metadata') || isset($nft->metadata)) {
                    $nmkrToLocalKeyMap = [
                        'projectCatalystCampaignName' => 'campaign_name',
                        'fundedProjectNumber' => 'Funded Project Number',
                        'projectTitle' => 'project_title',
                        'yesVotes' => 'yes_votes',
                        'noVotes' => 'no_votes',
                        'role' => 'role',
                    ];

                    $localMetadata = [];

                    if (is_string($nft->metadata)) {
                        $localMetadata = json_decode($nft->metadata, true);
                    } elseif (is_array($nft->metadata)) {
                        $localMetadata = $nft->metadata;
                    } elseif (is_object($nft->metadata)) {
                        $localMetadata = (array) $nft->metadata;
                    }

                    if (! is_array($localMetadata)) {
                        $localMetadata = [];
                    }

                    $localKey = $nmkrToLocalKeyMap[$metadataKey] ?? null;

                    foreach ($nmkrToLocalKeyMap as $nmkrKey => $localDbKey) {
                        if (isset($localMetadata[$nmkrKey])) {
                            unset($localMetadata[$nmkrKey]);
                        }
                    }

                    if ($localKey) {
                        if ($shouldRemove) {
                            if (isset($localMetadata[$localKey])) {
                                unset($localMetadata[$localKey]);
                            }
                        } else {
                            $localMetadata[$localKey] = (string) $value;
                        }
                    }

                    if (is_object($nft->metadata) && method_exists($nft->metadata, 'set')) {
                        foreach ($localMetadata as $k => $v) {
                            $nft->metadata->set($k, $v);
                        }
                    } else {
                        $nft->metadata = $localMetadata;
                    }

                    $nft->save();
                }

                return back()->with([
                    'success' => true,
                    'is_removed' => $shouldRemove,
                    'key' => $key,
                ]);
            } else {
                $errorData = $response->json();
                throw new \Exception('API update failed: '.($errorData['errorMessage'] ?? 'Unknown error'));
            }
        } catch (\Throwable $th) {
            Log::error('Metadata update error: '.$th->getMessage(), [
                'request' => $request->all(),
                'nft_id' => $nft->id,
                'exception' => $th,
                'trace' => $th->getTraceAsString(),
            ]);

            return back()->withErrors([
                'error' => 'Failed to update metadata: '.$th->getMessage(),
            ]);
        }
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
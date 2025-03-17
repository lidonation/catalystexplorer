<?php

declare(strict_types=1);

namespace App\Http\Controllers;

use App\Actions\TransformIdsToHashes;
use App\DataTransferObjects\IdeascaleProfileData;
use App\DataTransferObjects\ProposalData;
use App\Enums\CatalystCurrencySymbols;
use App\Enums\ProposalSearchParams;
use App\Enums\ProposalStatus;
use App\Models\IdeascaleProfile;
use App\Models\Nft;
use App\Models\Proposal;
use App\Models\User;
use App\Repositories\ProposalRepository;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Pagination\LengthAwarePaginator;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Fluent;
use Inertia\Inertia;
use Inertia\Response;

class CompletetProjectNftsController extends Controller
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

    public function index(Request $request): Response
    {
        $this->getProps($request);

        $proposals = $this->getClaimedIdeascaleProfilesProposals();

        $claimedIdeascaleProfiles = $this->getClaimedIdeascaleProfiles();

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

        $claimedIdeascaleProfiles = $this->getClaimedIdeascaleProfiles();

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

        return Inertia::render('CompletedProjectNfts/Index', [
            'proposals' => $proposals,
            'filters' => $this->queryParams,
            'ideascaleProfiles' => $claimedIdeascaleProfiles,
            'amountDistributedAda' => $amountDistributedAda,
            'amountDistributedUsd' => $amountDistributedUsd,
            'completedProposalsCount' => $completedProposalsCount,
            'communityMembersFunded' => $membersFunded,
            'ideascaleProfiles' => $claimedIdeascaleProfiles,
            'amountDistributedAda' => $amountDistributedAda,
            'amountDistributedUsd' => $amountDistributedUsd,
            'completedProposalsCount' => $completedProposalsCount,
            'communityMembersFunded' => $membersFunded,
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

        if (! empty($user)) {
            $claimedProfile = $proposal->ideascaleProfiles()
                ->where('claimed_by_id', $user->id)
                ->first();

            if ($claimedProfile) {
                $isOwner = true;
                $ideascaleProfile = $claimedProfile;

                $contributorProfiles = $proposal->ideascaleProfiles
                    ->filter(function ($profile) use ($ideascaleProfile) {
                        return $profile->id !== $ideascaleProfile->id;
                    })
                    ->values()
                    ->toArray();

                $nft = $ideascaleProfile->nfts()
                    ->whereJsonContains('metadata->project_title', $proposal->title)
                    ->first();
                $metadata = $nft->getRequiredNftMetadata();
            } else {
                $isOwner = false;
                $ideascaleProfile = $proposal->author()->first();
                $contributorProfiles = $proposal->ideascaleProfiles
                    ->values()
                    ->toArray();

                $nft = $ideascaleProfile->nfts()
                    ->whereJsonContains('metadata->project_title', $proposal->title)
                    ->first();
                $metadata = $nft->getRequiredNftMetadata();
            }
        } else {
            $isOwner = false;
            $claimedProfile = null;
            $ideascaleProfile = $proposal->author()->first();

            $contributorProfiles = $proposal->ideascaleProfiles
                ->filter(function ($profile) use ($ideascaleProfile) {
                    return $profile->id !== $ideascaleProfile->id;
                })
                ->values()
                ->toArray();

            $nft = $ideascaleProfile->nfts()
                ->whereJsonContains('metadata->project_title', $proposal->title)
                ->first();
            $metadata = $nft->getRequiredNftMetadata();
        }

        if (empty($ideascaleProfile)) {
            return back()->withErrors([
                'error' => 'No profile found for this proposal',
            ]);
        }

        $artist = null;
        if ($nft) {
            $artist = $nft->artist()->first();
        }

        return Inertia::render('CompletedProjectNfts/Partials/Show', [
            'proposal' => $proposal,
            'contributorProfiles' => $contributorProfiles,
            'claimedProfile' => $claimedProfile,
            'author' => $ideascaleProfile,
            'nft' => $nft,
            'metadata' => $metadata,
            'artist' => $artist,
            'isOwner' => $isOwner,
        ]);
    }

    public function getClaimedIdeascaleProfilesProposals()
    {
        $user = $this->user;

        $args = [];

        $page = 1;

        $limit = 3;

        if ($user) {
            $claimedIdeascaleIds = IdeascaleProfile::where('claimed_by_id', $user->id)
                ->pluck('id')
                ->filter()
                ->toArray();

            $claimedIdeascaleIdsString = implode(',', $claimedIdeascaleIds);
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
        }

        $proposalRepository = app(ProposalRepository::class);

        $builder = $proposalRepository->search(
            $this->queryParams[ProposalSearchParams::QUERY()->value] ?? '',
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

            // Check if NFT has direct metadata property
            if (property_exists($nft, 'metadata') || isset($nft->metadata)) {
                // Handle updating the direct metadata
                $metadata = $nft->metadata;

                // Map the frontend keys to the correct metadata keys
                $metadataKeyMap = [
                    'campaignName' => 'campaign_name',
                    'projectNumber' => 'Fund',
                    'projectTitle' => 'Project Title',
                    'yesVotes' => 'yes_votes',
                    'noVotes' => 'no_votes',
                    'role' => 'role',
                ];

                $metadataKey = $metadataKeyMap[$key] ?? $key;

                // Update the metadata based on the action
                if ($shouldRemove) {
                    if (isset($metadata[$metadataKey])) {
                        unset($metadata[$metadataKey]);
                    }
                } else {
                    $metadata[$metadataKey] = (string) $value;
                }

                $nft->metadata = $metadata;
                $nft->save();

                return back()->with([
                    'success' => true,
                    'is_removed' => $shouldRemove,
                    'key' => $key,
                ]);
            }

            // Fallback to the original method using metas
            $meta = $nft->metas->where('key', 'nmkr_metadata')->first();

            if (! $meta) {
                throw new \Exception('No metadata found for this NFT');
            }

            // Parse the JSON content
            $data = json_decode($meta->content, true);
            if (json_last_error() !== JSON_ERROR_NONE) {
                throw new \Exception('Invalid JSON metadata: '.json_last_error_msg());
            }

            // Find the policy key and NFT key
            if (! isset($data['721'])) {
                throw new \Exception('Missing 721 key in metadata');
            }

            $policyKey = array_key_first($data['721']);
            if (! $policyKey) {
                throw new \Exception('No policy key found in metadata');
            }

            $nftKeys = array_keys($data['721'][$policyKey]);
            if (empty($nftKeys)) {
                throw new \Exception('No NFT keys found in metadata');
            }

            $currentNftKey = $nftKeys[0];

            // Map frontend key names to metadata keys
            $metadataKeyMap = [
                'campaignName' => 'projectCatalystCampaignName',
                'projectNumber' => 'fundedProjectNumber',
                'projectTitle' => 'projectTitle',
                'yesVotes' => 'yesVotes',
                'noVotes' => 'noVotes',
                'role' => 'role',
            ];

            $metadataKey = $metadataKeyMap[$key] ?? $key;

            // Update the metadata based on the action
            if ($shouldRemove) {
                if (isset($data['721'][$policyKey][$currentNftKey][$metadataKey])) {
                    unset($data['721'][$policyKey][$currentNftKey][$metadataKey]);
                }
            } else {
                $data['721'][$policyKey][$currentNftKey][$metadataKey] = (string) $value;
            }

            $meta->content = json_encode($data);
            $meta->save();

            return back()->with([
                'success' => true,
                'is_removed' => $shouldRemove,
                'key' => $key,
            ]);
        } catch (\Throwable $th) {
            Log::error('Metadata update error: '.$th->getMessage(), [
                'request' => $request->all(),
                'nft_id' => $nft->id,
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
}

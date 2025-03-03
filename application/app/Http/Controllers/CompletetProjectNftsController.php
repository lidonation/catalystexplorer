<?php

declare(strict_types=1);

namespace App\Http\Controllers;

// use App\Models\Nft;
use App\DataTransferObjects\IdeascaleProfileData;
use App\DataTransferObjects\NMKRNftData;
use App\DataTransferObjects\ProposalData;
use App\Enums\CatalystCurrencySymbols;
use App\Enums\ProposalSearchParams;
use App\Enums\ProposalStatus;
use App\Models\IdeascaleProfile;
use App\Models\Proposal;
use App\Models\User;
use App\Repositories\ProposalRepository;
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

    public function show(Request $request, Proposal $proposal): Response
    {
        return Inertia::render('CompletedProjectNfts/Partials/Show', [
            'proposal' => $proposal,
        ]);
    }

    public function getClaimedIdeascaleProfilesProposals()
    {
        $user = $this->user;
        $user = $this->user;

        $args = [];

        $page = 1;

        $limit = 3;

        if ($user) {
            $claimedIdeascaleIds = IdeascaleProfile::where('claimed_by_id', $user->id)
                ->pluck('id')
                ->filter()
                ->toArray();
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

        $pagination = new LengthAwarePaginator(
            ProposalData::collect($response->hits),
            $response->estimatedTotalHits,
            $limit,
            $page,
            [
                'pageName' => 'p',
            ]
        );

        return $pagination->onEachSide(1)->toArray();
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

    public function updateNftMetadata(Request $request, $nft): void
    {
        // $nmkrMetadata = json_decode($nft->meta_info->nmkr_metadata, true);
        // $lidoMeta = $nmkrMetadata[721][$nft->policy][$nft->name];

        // if (! $nmkrMetadata) {
        //     return;
        // }

        // if ($request->remove) {
        //     $lidoMeta = array_filter($lidoMeta, function ($key) use ($request) {
        //         return $key !== $request->meta['key'];
        //     }, ARRAY_FILTER_USE_KEY);
        // } else {
        //     $lidoMeta[$request->meta['key']] = (string) $request->meta['value'];
        // }

        // $nmkrMetadata[721][$nft->policy][$nft->name] = $lidoMeta;

        // if (! $nft->meta_info->nmkr_project_uid && ! $nft->meta_info->nmkr_nftuid) {
        //     return;
        // }

        // try {

        //     $req = $nft->updateNft($nmkrMetadata);

        //     $response = $req->json();
        //     $metadata = json_decode($response['metadata'], true);

        //     $policy = array_key_first($metadata[721]);

        //     $nft->policy = $policy;
        //     $nft->save();

        //     // save meta data
        //     $nft->saveMeta('nmkr_metadata', json_encode($metadata), null, true);
        // } catch (\Throwable $th) {
        //     //throw $th;
        //     Log::error("Error Updating Remote Nft:{$response['resultState']}");
        // }

    }

    public function getNftDetails($nft, Request $request): ?NMKRNftData
    {
        return null;
        // $response = $nft->getNMKRNftMetadata();

        // return  NMKRNftData::fromArray($response->json());
    }
}

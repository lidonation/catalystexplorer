<?php

declare(strict_types=1);

namespace App\Http\Controllers;

use App\DataTransferObjects\AnnouncementData;
use App\DataTransferObjects\MetricData;
use App\DataTransferObjects\ProposalData;
use App\Enums\MetricsContext;
use App\Enums\ProposalStatus;
use App\Enums\StatusEnum;
use App\Models\Announcement;
use App\Models\Connection;
use App\Models\Fund;
use App\Models\IdeascaleProfile;
use App\Models\Proposal;
use App\Repositories\AnnouncementRepository;
use App\Repositories\MetricRepository;
use App\Repositories\PostRepository;
use App\Repositories\ProposalRepository;
use Illuminate\Support\Facades\Config;
use Inertia\Inertia;
use Inertia\Response;

class HomeController extends Controller
{
    public function index(
        PostRepository $postRepository,
        ProposalRepository $proposals,
        MetricRepository $metrics,
        AnnouncementRepository $announcements
    ): Response {
        return Inertia::render('Home/Index', [
            'posts' => Inertia::optional(
                fn () => $this->getPosts($postRepository)
            ),
            'proposals' => Inertia::optional(
                fn () => $this->getProposals($proposals)
            ),
            'metrics' => Inertia::optional(
                fn () => collect($this->getHomeMetrics($metrics))
                    ->filter(
                        fn (MetricData $metric) => ! empty($metric->chartData) &&
                            ! empty($metric->chartData['data']) &&
                            collect($metric->chartData['data'])->contains(fn ($point) => ! empty($point['y']))
                    )
                    ->values()
            ),
            'announcements' => Inertia::optional(
                fn () => $this->getAnnouncements($announcements)
            ),
            'specialAnnouncements' => Inertia::optional(
                fn () => $this->getSpecialAnnouncements()
            ),
            'quickPitches' => fn () => $this->getProposalQuickPitches($proposals),
            'quickPitchesFundId' => Fund::latest('launched_at')->value('id'),
        ]);
    }

    public function getPosts(PostRepository $postRepository)
    {
        $postRepository->setQuery([
            'tags' => 'project-catalyst',
        ]);

        try {
            return $postRepository->paginate(4)->setMaxPages(1)->collect()->all();
        } catch (\Throwable $e) {
            report($e);

            return new \Illuminate\Pagination\LengthAwarePaginator(
                null,
                0,
                4,
                request('page', 1),
                [
                    'path' => request()->url(),
                    'query' => request()->query(),
                ]
            );
        }
    }

    private function getProposals(ProposalRepository $proposals)
    {
        try {
            return ProposalData::collect(
                $proposals->with(['users', 'campaign', 'fund'])
                    ->limit(3)
                    ->where('status', '=', ProposalStatus::complete()->value)
                    ->inRandomOrder()
                    ->get()
            );
        } catch (\Throwable $e) {
            report($e);

            return collect([]);
        }
    }

    private function getAnnouncements(AnnouncementRepository $announcements)
    {
        try {
            return AnnouncementData::collect(
                $announcements
                    ->limit(6)
                    ->getQuery()
                    ->where('context', '!=', 'home')
                    ->latest('event_ends_at')
                    ->get()
            );
        } catch (\Throwable $e) {
            report($e);

            return collect([]);
        }
    }

    private function getSpecialAnnouncements()
    {
        try {
            return AnnouncementData::collect(
                Announcement::query()
                    ->where('context', 'special')
                    ->latest('event_ends_at')
                    ->limit(6)
                    ->get()
                    ->map(fn ($announcement) => [
                        'id' => $announcement->id,
                        'title' => $announcement->title,
                        'content' => $announcement->content,
                        'cta' => $announcement->cta,
                        'hero_image_url' => $announcement->heroPhotoUrl,
                    ])
            );
        } catch (\Throwable $e) {
            report($e);

            return collect([]);
        }
    }

    private function getHomeMetrics(MetricRepository $metrics)
    {
        $defaultLimit = Config::get('app.metric_card.default_limit', 5);

        return MetricData::collect(
            $metrics->limit($defaultLimit)
                ->getQuery()
                ->where('context', MetricsContext::HOME)
                ->where('status', StatusEnum::published()->value)
                ->orderByDesc('order')
                ->get()
        );
    }

    private function getProposalQuickPitches(ProposalRepository $proposals)
    {
        $activeFundId = Fund::latest('launched_at')->value('id');

        try {
            $rawProposals = Proposal::with(['users', 'campaign', 'fund', 'ideascale_profiles'])
                ->whereNotNull('quickpitch')
                ->where('fund_id', $activeFundId)
                ->limit(15)
                ->get();

            // Add all counts to each proposal
            $rawProposals->each(function ($proposal) {
                $ideascaleProfileIds = $proposal->ideascale_profiles ? $proposal->ideascale_profiles->pluck('id')->toArray() : [];
                $counts = $this->getAllCounts($ideascaleProfileIds);
                $proposal->connections_count = $counts['catalystConnectionCount'];
                $proposal->completed_proposals_count = $counts['userCompleteProposalsCount'];
                $proposal->outstanding_proposals_count = $counts['userOutstandingProposalsCount'];
            });

            if ($rawProposals->count() < 3) {
                // Shuffle the small collection
                $shuffledProposals = $rawProposals->shuffle();

                return [
                    'featured' => collect([]),
                    'regular' => ProposalData::collect($shuffledProposals),
                ];
            }

            // Shuffle the entire collection first
            $shuffledProposals = $rawProposals->shuffle();
            $featuredRaw = $shuffledProposals->take(3);

            $featuredIds = $featuredRaw->pluck('id');
            $regularRaw = $shuffledProposals->skip(3);

            return [
                'featured' => ProposalData::collect($featuredRaw->shuffle()),
                'regular' => ProposalData::collect($regularRaw->shuffle()),
            ];

        } catch (\Throwable $e) {
            report($e);

            return [
                'featured' => collect([]),
                'regular' => collect([]),
            ];
        }
    }

    private function getAllCounts(array $ideascaleProfileIds): array
    {
        if (empty($ideascaleProfileIds)) {
            return [
                'userCompleteProposalsCount' => 0,
                'userOutstandingProposalsCount' => 0,
                'catalystConnectionCount' => 0,
            ];
        }

        try {
            $userCompleteProposalsCount = Proposal::where('status', 'complete')
                ->whereHas('ideascaleProfiles', function ($query) use ($ideascaleProfileIds) {
                    $query->whereIn('ideascale_profiles.id', $ideascaleProfileIds);
                })
                ->count();

            $userOutstandingProposalsCount = Proposal::where('status', 'in_progress')
                ->whereHas('ideascaleProfiles', function ($query) use ($ideascaleProfileIds) {
                    $query->whereIn('ideascale_profiles.id', $ideascaleProfileIds);
                })
                ->count();

            $catalystConnectionCount = Connection::whereIn('previous_model_id', $ideascaleProfileIds)
                ->where('previous_model_type', IdeascaleProfile::class)
                ->distinct()
                ->count();

            return [
                'userCompleteProposalsCount' => $userCompleteProposalsCount,
                'userOutstandingProposalsCount' => $userOutstandingProposalsCount,
                'catalystConnectionCount' => $catalystConnectionCount,
            ];
        } catch (\Exception $e) {
            return [
                'userCompleteProposalsCount' => 0,
                'userOutstandingProposalsCount' => 0,
                'catalystConnectionCount' => 0,
            ];
        }
    }
}

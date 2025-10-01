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
            $rawProposals = Proposal::forQuickPitch()
                ->with([
                    'campaign:id,title,slug',
                    'fund:id,title,slug',
                    'team.model' => function ($query) {
                        $query->select('id', 'name', 'username');
                    },
                ])
                ->whereNotNull('quickpitch')
                ->where('fund_id', $activeFundId)
                ->limit(15)
                ->get();

            $this->addTeamBasedCounts($rawProposals);

            return ProposalData::collect($rawProposals);

        } catch (\Throwable $e) {
            report($e);

            return collect([]);
        }
    }

    /**
     * Optimized method to add proposal counts using team relationships and Eloquent
     */
    private function addTeamBasedCounts($proposals)
    {
        if ($proposals->isEmpty()) {
            return;
        }

        $allProfileIds = collect();
        $proposalProfileMap = [];

        foreach ($proposals as $proposal) {
            $profileIds = [];
            if ($proposal->team && $proposal->team->isNotEmpty()) {
                $profileIds = $proposal->team->pluck('model.id')->filter()->values()->toArray();
            }
            $proposalProfileMap[$proposal->id] = $profileIds;
            $allProfileIds = $allProfileIds->merge($profileIds);
        }

        $uniqueProfileIds = $allProfileIds->unique()->values()->toArray();

        if (empty($uniqueProfileIds)) {
            foreach ($proposals as $proposal) {
                $proposal->connections_count = 0;
                $proposal->completed_proposals_count = 0;
                $proposal->outstanding_proposals_count = 0;
            }

            return;
        }

        try {
            $completedCounts = Proposal::where('status', 'complete')
                ->whereHas('team', function ($query) use ($uniqueProfileIds) {
                    $query->whereIn('profile_id', $uniqueProfileIds);
                })
                ->with(['team' => function ($query) use ($uniqueProfileIds) {
                    $query->whereIn('profile_id', $uniqueProfileIds);
                }])
                ->get()
                ->flatMap(function ($proposal) {
                    return $proposal->team->pluck('profile_id');
                })
                ->countBy()
                ->toArray();

            $outstandingCounts = Proposal::where('status', 'in_progress')
                ->whereHas('team', function ($query) use ($uniqueProfileIds) {
                    $query->whereIn('profile_id', $uniqueProfileIds);
                })
                ->with(['team' => function ($query) use ($uniqueProfileIds) {
                    $query->whereIn('profile_id', $uniqueProfileIds);
                }])
                ->get()
                ->flatMap(function ($proposal) {
                    return $proposal->team->pluck('profile_id');
                })
                ->countBy()
                ->toArray();

            $connectionCounts = Connection::whereIn('previous_model_id', $uniqueProfileIds)
                ->where('previous_model_type', IdeascaleProfile::class)
                ->selectRaw('previous_model_id, COUNT(*) as count')
                ->groupBy('previous_model_id')
                ->pluck('count', 'previous_model_id')
                ->toArray();

            foreach ($proposals as $proposal) {
                $profileIds = $proposalProfileMap[$proposal->id];

                $proposal->completed_proposals_count = 0;
                $proposal->outstanding_proposals_count = 0;
                $proposal->connections_count = 0;

                foreach ($profileIds as $profileId) {
                    $proposal->completed_proposals_count += $completedCounts[$profileId] ?? 0;
                    $proposal->outstanding_proposals_count += $outstandingCounts[$profileId] ?? 0;
                    $proposal->connections_count += $connectionCounts[$profileId] ?? 0;
                }
            }
        } catch (\Exception $e) {
            \Log::warning('Error calculating team-based counts', [
                'error' => $e->getMessage(),
                'profile_ids_count' => count($uniqueProfileIds),
            ]);

            foreach ($proposals as $proposal) {
                $proposal->connections_count = 0;
                $proposal->completed_proposals_count = 0;
                $proposal->outstanding_proposals_count = 0;
            }
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

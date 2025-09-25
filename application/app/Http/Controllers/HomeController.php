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
use App\Models\Fund;
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
            'quickPitches' => $this->getProposalQuickPitches($proposals),
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
            $rawProposals = $proposals
                ->with(['users', 'campaign', 'fund'])
                ->whereNotNull('quickpitch')
                ->where('fund_id', $activeFundId)
                ->limit(15)
                ->get();

            if ($rawProposals->count() < 3) {
                return [
                    'featured' => collect([]),
                    'regular' => ProposalData::collect($rawProposals),
                ];
            }

            $featuredRaw = $rawProposals->random(3);

            $featuredIds = $featuredRaw->pluck('id');
            $regularRaw = $rawProposals->whereNotIn('id', $featuredIds);

            return [
                'featured' => ProposalData::collect($featuredRaw),
                'regular' => ProposalData::collect($regularRaw),
            ];

        } catch (\Throwable $e) {
            report($e);

            return [
                'featured' => collect([]),
                'regular' => collect([]),
            ];
        }
    }
}

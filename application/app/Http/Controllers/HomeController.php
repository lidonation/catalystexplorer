<?php

declare(strict_types=1);

namespace App\Http\Controllers;

use App\DataTransferObjects\AnnouncementData;
use App\DataTransferObjects\MetricData;
use App\DataTransferObjects\ProposalData;
use App\Enums\MetricsContext;
use App\Enums\StatusEnum;
use App\Models\Announcement;
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
                fn () => ProposalData::collect(
                    $proposals->with(['users', 'campaign', 'fund'])
                        ->limit(3)
                        ->inRandomOrder()
                        ->get()
                )
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
                fn () => AnnouncementData::collect($announcements
                    ->limit(6)
                    ->getQuery()
                    ->where('context', '!=', 'home')
                    ->latest('event_ends_at')
                    ->get())
            ),
            'specialAnnouncements' => Inertia::optional(
                fn () => AnnouncementData::collect(
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
                )
            ),
        ]);
    }

    public function getPosts(PostRepository $postRepository)
    {

        $postRepository->setQuery([
            'tags' => 'project-catalyst',
        ]);

        $posts = [];

        try {
            $posts = $postRepository->paginate(4)->setMaxPages(1)->collect()->all();
        } catch (\Throwable $e) {
            report($e);

            $posts = new \Illuminate\Pagination\LengthAwarePaginator(
                collect([]),
                0,
                4,
                request('page', 1),
                [
                    'path' => request()->url(),
                    'query' => request()->query(),
                ]
            );
        }

        return $posts;
    }

    private function getHomeMetrics(MetricRepository $metrics)
    {
        // Retrieve the default metric limit from the configuration
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
}

<?php declare(strict_types=1);

namespace App\Http\Controllers;

use Inertia\Inertia;
use Inertia\Response;
use App\Models\Announcement;
use App\Repositories\PostRepository;
use App\Repositories\MetricRepository;
use App\DataTransferObjects\MetricData;
use App\Repositories\ProposalRepository;
use App\DataTransferObjects\ProposalData;
use App\Repositories\AnnouncementRepository;
use App\DataTransferObjects\AnnouncementData;

class HomeController extends Controller
{
    public function index(
        PostRepository $posts,
        ProposalRepository $proposals,
        MetricRepository $metrics,
        AnnouncementRepository $announcements
    ): Response {
        $posts->setQuery([
            'tags' => 'project-catalyst'
        ]);

        return Inertia::render('Home/Index', [
            'posts' => Inertia::optional(
                fn() => $posts->paginate(4)->setMaxPages(1)->collect()->all()
            ),
            'proposals' => Inertia::optional(
                fn() => ProposalData::collect(
                    $proposals->with(['users', 'campaign', 'fund'])
                        ->limit(3)
                        ->inRandomOrder()
                        ->get()
                )
            ),
            'metrics' => Inertia::optional(
                fn() => MetricData::collect($metrics
                    ->limit(6)
                    ->getQuery()
                    ->where('context', 'home')
                    ->orderByDesc('order')
                    ->get())
            ),
            'announcements' => Inertia::optional(
                fn() => AnnouncementData::collect($announcements
                    ->limit(6)
                    ->getQuery()
                    ->where('context', '!=', 'home')
                    ->latest('event_ends_at')
                    ->get())
            ),
            'specialAnnouncements' => Inertia::optional(
                fn() => AnnouncementData::collect(
                    Announcement::query()
                        ->where('context', 'special')
                        ->latest('event_ends_at')
                        ->limit(6)
                        ->get()
                        ->map(fn($announcement) => [
                            'id' => $announcement->id,
                            'title' => $announcement->title,
                            'content' => $announcement->content,
                            'cta' => collect($announcement->cta)->map(fn($ctaItem) => [
                                'label' => $ctaItem['label'],
                                'link' => $ctaItem['link'],
                                'title' => $ctaItem['title'],
                            ])->toArray(), // Converts Collection to an array
                            'hero_image_url' => $announcement->heroPhotoUrl,
                        ])
                )
            ),
        ]);
    }
}

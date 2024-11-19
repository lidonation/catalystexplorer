<?php

declare(strict_types=1);

namespace App\Http\Controllers;

use App\DataTransferObjects\MetricData;
use App\DataTransferObjects\ProposalData;
use App\Repositories\MetricRepository;
use App\Repositories\PostRepository;
use App\Repositories\ProposalRepository;
use Inertia\Inertia;
use Inertia\Response;

class HomeController extends Controller
{
    public function index(
        PostRepository     $posts,
        ProposalRepository $proposals,
        MetricRepository   $metrics
    ): Response
    {
        $posts->setQuery([
            'tags' => 'project-catalyst'
        ]);

        return Inertia::render('Home/Index', [
            'posts' => Inertia::optional(
                fn() => $posts->paginate(4)->setMaxPages(1)->collect()->all()
            ),
            'proposals' => Inertia::optional(
                fn() => ProposalData::collect(
                    $proposals->with(['users', 'campaign'])
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
        ]);
    }
}

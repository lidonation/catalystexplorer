<?php

declare(strict_types=1);

namespace App\Http\Controllers;

use App\Repositories\PostRepository;
use Inertia\Inertia;
use Inertia\Response;

class HomeController extends Controller
{
    public function index(PostRepository $posts): Response
    {
        $posts->setQuery([
            'tags' => 'project-catalyst'
        ]);

        return Inertia::render('Home/Index', [
            'posts' => Inertia::optional(
                fn() => $posts->paginate(4)->setMaxPages(1)->collect()->all()
            )
        ]);
    }
}

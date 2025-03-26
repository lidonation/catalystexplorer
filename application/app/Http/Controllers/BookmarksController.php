<?php

declare(strict_types=1);

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class BookmarksController extends Controller
{
    /**
     * Display the bookmarks index page.
     */
    public function index(Request $request): Response
    {
        return Inertia::render('Bookmarks/Index');
    }
}

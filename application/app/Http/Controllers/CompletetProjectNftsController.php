<?php

declare(strict_types=1);

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;
use App\Models\Proposal;

class CompletetProjectNftsController extends Controller
{
    /**
     * Display the user's profile form.
     */
    public function index(Request $request): Response
    {
        return Inertia::render('CompletedProjectNfts/Index');
    }

    public function show(Request $request, Proposal $proposal): Response
    {
        return Inertia::render('CompletedProjectNfts/Partials/Show');
    }
}

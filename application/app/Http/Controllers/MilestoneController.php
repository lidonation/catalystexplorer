<?php

declare(strict_types=1);

namespace App\Http\Controllers;

use App\Models\Fund;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class MilestoneController extends Controller
{
    /**
     * Display the user's profile form.
     */
    public function index(Request $request): Response
    {
        $funds = Fund::all(); // Or use a more specific query to get funds

        return Inertia::render('ActiveFund/Index', [
            'funds' => $funds,
        ]);
    }
}

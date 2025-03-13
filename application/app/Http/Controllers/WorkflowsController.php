<?php

declare(strict_types=1);

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Inertia\Inertia;

class WorkflowsController extends Controller
{
    public function index(Request $request, string $workflow, int $step)
    {
        return Inertia::render('CompletedProjectNfts/Partials/ProfileWorkflow', [

        ]);
    }
}

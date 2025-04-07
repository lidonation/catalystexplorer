<?php

declare(strict_types=1);

namespace App\Http\Controllers;

use App\Http\Requests\Auth\LoginRequest;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class WorkflowController extends Controller
{
    public function auth(Request $request): Response
    {
        return Inertia::render('Workflows/Login');
    }

    public function login(LoginRequest $request): RedirectResponse
    {

        $request->authenticate();

        $nextRoute = session()->pull('nextstep.route');
        $nextRouteParam = session()->pull('nextstep.param');

        $request->session()->regenerate();

        return to_route($nextRoute, $nextRouteParam);
    }
}

<?php

declare(strict_types=1);

namespace App\Http\Controllers;

use Inertia\Inertia;
use Inertia\Response;
use Illuminate\Http\Request;
use Illuminate\Http\RedirectResponse;
use App\Http\Requests\Auth\LoginRequest;

class WorkflowController extends Controller
{
    public function auth(Request $request): Response
    {

        return Inertia::render('Workflows/Login');
    }

    public function login(LoginRequest $request): RedirectResponse
    {

        $nextRoute = session()->pull('nextstep.route');
        $nextRouteParam = session()->pull('nextstep.param');

        $request->authenticate();

        $request->session()->regenerate();

        return to_route($nextRoute, $nextRouteParam);
    }
}

<?php

declare(strict_types=1);

namespace App\Http\Controllers;

use App\Http\Requests\Auth\LoginRequest;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;

class WorkflowController extends Controller
{
    public function auth(Request $request)
    {

        return Inertia::render('Workflows/Login');
    }

    public function login(LoginRequest $request): RedirectResponse
    {

        $nextRoute = session()->pull('nextstep.route');
        $nextRouteParam = session()->pull('nextstep.param');

        $request->authenticate();

        $request->session()->regenerate();

        session()->put('intended.url', route($nextRoute, $nextRouteParam));

        return redirect()->intended($request->intended_url);
    }
}

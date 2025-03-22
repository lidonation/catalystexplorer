<?php

declare(strict_types=1);

namespace App\Http\Controllers;

use App\Http\Requests\Auth\LoginRequest;
use Illuminate\Http\Request;
use Inertia\Inertia;

class WorkflowController extends Controller
{
    public function auth(Request $request)
    {

        return Inertia::render('Workflows/Login');
    }

    public function login(LoginRequest $request)
    {

        $nextRoute = session()->pull('nextstep.route');
        $nextRouteParam = session()->pull('nextstep.param');

        $request->authenticate();

        $request->session()->regenerate();

        return to_route($nextRoute, $nextRouteParam);
    }
}

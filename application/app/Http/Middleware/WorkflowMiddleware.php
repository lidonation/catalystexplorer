<?php

declare(strict_types=1);

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use Symfony\Component\HttpFoundation\Response;

class WorkflowMiddleware
{
    /**
     * Handle an incoming request.
     *
     * @param  \Closure(\Illuminate\Http\Request): (\Symfony\Component\HttpFoundation\Response)  $next
     */
    public function handle(Request $request, Closure $next): Response
    {

        Log::info('Authenticated user: ', ['user' => $request->user()]);

        if (! $request->user()) {
            Log::info('to login');
            session()->put('nextstep.route', request()->route()->getName());
            session()->put('nextstep.param', request()->route()->parameters());

            return to_route('workflows.loginForm');
        }

        return $next($request);
    }
}

<?php

declare(strict_types=1);

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Illuminate\Support\Str;
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
        if (! $request->user()) {

            if (! session()->has('nextstep.route') && Str::doesntContain($request->route()->getName(), 'login')) {
                session()->put('nextstep.route', $request->route()->getName());
                session()->put('nextstep.param', $request->route()->parameters());
            }

            return to_route('workflows.loginForm');
        }

        return $next($request);
    }
}

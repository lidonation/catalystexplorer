<?php

declare(strict_types=1);

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class CaptureIntendedUrl
{
    /**
     * Handle an incoming request.
     *
     * @param  \Closure(\Illuminate\Http\Request): (\Symfony\Component\HttpFoundation\Response)  $next
     */
    public function handle(Request $request, Closure $next): Response
    {
        // Skip storing URL for authentication-related routes
        if ($request->is(['login', 'register', 'logout']) ||
            $request->routeIs(['login', 'register', 'logout'])) {
            return $next($request);
        }

        $referer = $request->header('Referer');

        if ($referer && $referer !== $request->fullUrl()) {
            $request->session()->put('url.intended', $referer);
        }

        return $next($request);
    }
}

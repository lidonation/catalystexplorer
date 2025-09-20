<?php

declare(strict_types=1);

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Illuminate\Http\Response as LaravelResponse;
use Illuminate\Support\Str;
use Inertia\Response as InertiaResponse;
use InertiaUI\Modal\Modal;
use Symfony\Component\HttpFoundation\Response as SymfonyResponse;

class CaptureIntendedUrl
{
    /**
     * Handle an incoming request.
     *
     * @param  \Closure(Request): (SymfonyResponse)  $next
     */
    public function handle(Request $request, Closure $next): SymfonyResponse|LaravelResponse|InertiaResponse|Modal
    {
        if ($this->isAuthRoute($request)) {
            return $next($request);
        }

        if (! $request->user() && $request->method() === 'GET') {
            $intendedUrl = $this->determineIntendedUrl($request);

            if ($intendedUrl && $this->isValidIntendedUrl($intendedUrl, $request)) {
                $request->session()->put('url.intended', $intendedUrl);
            }
        }

        return $next($request);
    }

    /**
     * Check if the current request is for an authentication route
     */
    private function isAuthRoute(Request $request): bool
    {
        $authRoutes = ['login', 'register', 'logout', 'password.request', 'password.reset', 'password.confirm', 'verification.notice'];
        $authPaths = ['login', 'register', 'logout', 'password/*', 'email/*'];

        return $request->is($authPaths) || $request->routeIs($authRoutes);
    }

    /**
     * Determine the intended URL from the request
     */
    private function determineIntendedUrl(Request $request): ?string
    {
        if ($request->has('intended')) {
            return $request->query('intended');
        }

        $currentUrl = $request->fullUrlWithoutQuery(['intended']);
        $referer = $request->header('Referer');
        if ($this->isHomepage($currentUrl) && $referer && $referer !== $currentUrl) {
            return $referer;
        }

        return $currentUrl;
    }

    /**
     * Check if the URL represents the homepage
     */
    private function isHomepage(string $url): bool
    {
        $parsedUrl = parse_url($url);
        $path = $parsedUrl['path'] ?? '/';

        return $path === '/' || preg_match('/^\/[a-z]{2}\/?$/', $path);
    }

    /**
     * Validate that the intended URL is safe for redirection
     */
    private function isValidIntendedUrl(string $url, Request $request): bool
    {
        $parsedUrl = parse_url($url);

        if ($parsedUrl === false) {
            return false;
        }

        if (isset($parsedUrl['host'])) {
            $requestHost = $request->getHost();
            if ($parsedUrl['host'] !== $requestHost) {
                return false;
            }
        }

        $path = $parsedUrl['path'] ?? '/';

        return $this->isValidPath($path);
    }

    /**
     * Check if the path is valid for redirection
     */
    private function isValidPath(string $path): bool
    {
        $authPaths = ['/login', '/register', '/logout', '/password', '/email'];

        foreach ($authPaths as $authPath) {
            if (Str::startsWith($path, $authPath) ||
                preg_match('/^\/[a-z]{2}'.preg_quote($authPath, '/').'/', $path)) {
                return false;
            }
        }

        if (Str::startsWith($path, '/api/')) {
            return false;
        }

        if (Str::startsWith($path, '/admin/')) {
            return false;
        }

        return true;
    }
}

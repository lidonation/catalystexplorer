<?php

declare(strict_types=1);

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use App\Http\Requests\Auth\LoginRequest;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Route;
use Illuminate\Support\Facades\Session;
use Inertia\Inertia;
use Inertia\Response;

class AuthenticatedSessionController extends Controller
{
    /**
     * Display the login view.
     */
    public function create(): Response
    {
        if (request()->has('intended')) {
            $intendedUrl = request()->query('intended');
            if ($this->isValidRedirectUrl($intendedUrl)) {
                session(['url.intended' => $intendedUrl]);
            }
        }

        return Inertia::render('Auth/Login', [
            'canResetPassword' => Route::has('password.request'),
            'status' => session('status'),
            'intendedUrl' => session('url.intended'),
        ]);
    }

    /**
     * Handle an incoming authentication request.
     */
    public function store(LoginRequest $request): RedirectResponse
    {
        $request->authenticate();

        $request->session()->regenerate();

        $redirectUrl = $this->getValidatedRedirectUrl($request);

        session()->forget('url.intended');

        return redirect($redirectUrl);
    }

    /**
     * Handle an incoming wallet authentication request.
     */
    public function walletLogin(LoginRequest $request)
    {
        $request->authenticateWallet();

        $request->session()->regenerate();

        $redirectUrl = $this->getValidatedRedirectUrl($request);

        session()->forget('url.intended');

        return redirect($redirectUrl);
    }

    /**
     * Destroy an authenticated session.
     */
    public function destroy(Request $request): RedirectResponse
    {
        Auth::guard('web')->logout();

        $request->session()->invalidate();

        $request->session()->regenerateToken();

        return redirect('/');
    }

    /**
     * Get a validated redirect URL, with fallbacks
     */
    private function getValidatedRedirectUrl(Request $request): string
    {
        $formRedirect = $request->input('redirect');
        if ($formRedirect && $this->isValidRedirectUrl($formRedirect)) {
            return $formRedirect;
        }

        $intendedUrl = session('url.intended');
        if ($intendedUrl && $this->isValidRedirectUrl($intendedUrl)) {
            return $intendedUrl;
        }

        $referer = $request->header('referer');
        if ($referer && $this->isValidRedirectUrl($referer)) {
            return $referer;
        }

        return $this->getDefaultRedirectUrl();
    }

    /**
     * Validate that a URL is safe for redirection
     */
    private function isValidRedirectUrl(?string $url): bool
    {
        if (! $url) {
            return false;
        }

        $parsedUrl = parse_url($url);
        if ($parsedUrl === false) {
            return false;
        }

        if (isset($parsedUrl['host'])) {
            $currentHost = request()->getHost();
            if ($parsedUrl['host'] !== $currentHost) {
                return false;
            }
        }

        $path = $parsedUrl['path'] ?? '/';

        return $this->isValidRedirectPath($path);
    }

    /**
     * Check if a path is valid for redirection
     */
    private function isValidRedirectPath(string $path): bool
    {
        $invalidPaths = ['/login', '/register', '/logout', '/password', '/email'];

        foreach ($invalidPaths as $invalidPath) {
            if (str_starts_with($path, $invalidPath) ||
                preg_match('/^\/[a-z]{2}'.preg_quote($invalidPath, '/').'/', $path)) {
                return false;
            }
        }

        if (str_starts_with($path, '/api/')) {
            return false;
        }

        return true;
    }

    /**
     * Get the default redirect URL after login
     */
    private function getDefaultRedirectUrl(): string
    {
        return '/';
    }
}

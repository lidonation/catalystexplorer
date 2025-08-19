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
        return Inertia::render('Auth/Login', [
            'canResetPassword' => Route::has('password.request'),
            'status' => session('status'),
        ]);
    }

    /**
     * Handle an incoming authentication request.
     */
    public function store(LoginRequest $request): RedirectResponse
    {
        $request->authenticate();

        $request->session()->regenerate();

        $intendedDestination = session('url.intended');

        session()->forget('url.intended');

        if ($intendedDestination) {
            return redirect($intendedDestination);
        }

        return redirect('/');
    }

    /**
     * Handle an incoming authentication request.
     */
    public function walletLogin(LoginRequest $request)
    {
        $request->authenticateWallet();

        $request->session()->regenerate();

        $intendedDestination = session('url.intended');

        session()->forget('url.intended');

        if ($intendedDestination) {
            return redirect($intendedDestination);
        }

        return redirect('/');

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
}

<?php

declare(strict_types=1);

namespace App\Http\Controllers;

use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Cookie;
use Illuminate\Support\Facades\Session;

class GuestLanguageController extends Controller
{
    /**
     * Update guest's language preference
     */
    public function updateGuestLanguage(Request $request): JsonResponse
    {
        $request->validate([
            'language' => 'required|string|in:am,ar,de,en,es,fr,ja,ko,pt,sw,zh',
        ]);

        $language = $request->input('language');

        Session::put('guest_language', $language);

        Cookie::queue('guest_language', $language, 60 * 24 * 90);

        return response()->json(['success' => true]);
    }

    /**
     * Get guest's current language preference
     */
    public function getCurrentGuestLanguage(Request $request): JsonResponse
    {
        $language = Session::get('guest_language')
                   ?? $request->cookie('guest_language')
                   ?? app()->getLocale();

        return response()->json([
            'language' => $language,
        ]);
    }

    /**
     * Get the language preference for use during registration
     */
    public static function getGuestLanguageForRegistration(Request $request): string
    {
        return Session::get('guest_language')
               ?? $request->cookie('guest_language')
               ?? app()->getLocale();
    }
}

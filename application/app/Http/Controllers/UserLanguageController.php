<?php

declare(strict_types=1);

namespace App\Http\Controllers;

use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class UserLanguageController extends Controller
{
    /**
     * Update user's preferred language
     */
    public function updateLanguage(Request $request): JsonResponse
    {
        $request->validate([
            'language' => 'required|string|in:am,ar,de,en,es,fr,ja,ko,pt,sw,zh',
        ]);

        $user = Auth::user();
        if (! $user) {
            return response()->json(['error' => 'User not authenticated'], 401);
        }

        $user->update([
            'lang' => $request->input('language'),
        ]);

        return response()->json(['success' => true]);
    }

    /**
     * Get user's current language preference
     */
    public function getCurrentLanguage(): JsonResponse
    {
        $user = Auth::user();
        if (! $user) {
            return response()->json(['error' => 'User not authenticated'], 401);
        }

        return response()->json([
            'language' => $user->getPreferredLanguage(),
        ]);
    }
}

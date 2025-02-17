<?php

declare(strict_types=1);

namespace App\Interfaces\Http\Middleware;

use App\DataTransferObjects\UserData;
use App\Models\User;
use App\Services\HashIdService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\App;
use Inertia\Middleware;

class HandleInertiaRequests extends Middleware
{
    /**
     * The root template that is loaded on the first page visit.
     *
     * @var string
     */
    protected $rootView = 'app';

    /**
     * Determine the current asset version.
     */
    public function version(Request $request): ?string
    {
        return parent::version($request);
    }

    /**
     * Define the props that are shared by default.
     *
     * @return array<string, mixed>
     */
    public function share(Request $request): array
    {
        $user = null;

        if ($request->user()) {
            try {
                // Decode the hashed ID
                $userId = (new HashIdService(new User))->decode($request->user()->id);

                // Validate the decoded ID
                if (! is_numeric($userId)) {
                    throw new \Exception('Decoded user ID is not a valid integer.');
                }

                // Fetch the user
                $user = UserData::from(User::findOrFail((int) $userId));
            } catch (\Exception $e) {
                \Log::error('Failed to decode or fetch user:', ['error' => $e->getMessage()]);
                // Optionally, handle the error (e.g., return a default user or throw an exception)
            }
        }

        return [
            ...parent::share($request),
            'locale' => app()->getLocale(),
            'auth' => [
                'user' => $request->user() ? UserData::from($request->user()) : null,
                'isDownForMaintenance' => App::isDownForMaintenance(),
                'locale' => app()->getLocale(),
            ],
        ];
    }
}

<?php

declare(strict_types=1);

namespace App\Http\Middleware;

use App\DataTransferObjects\UserData;
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

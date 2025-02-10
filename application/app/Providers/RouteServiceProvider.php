<?php

declare(strict_types=1);

namespace App\Providers;

use App\Models\BookmarkCollection;
use App\Models\BookmarkItem;
use App\Models\IdeascaleProfile;
use App\Models\Proposal;
use App\Services\HashIdService;
use Exception;
use Illuminate\Routing\Router;
use Illuminate\Support\Facades\Route;
use Illuminate\Support\ServiceProvider;

class RouteServiceProvider extends ServiceProvider
{
    /**
     * The path to the "home" route for your application.
     *
     * This is used by Laravel authentication to redirect users after login.
     *
     * @var string
     */
    public const string HOME = '/';

    /**
     * Register services.
     */
    public function register(): void
    {
        Route::bind('id', function ($hashId) {
            try {
                $paths = collect(explode('/', request()->path()));
                $hashIndex = $paths->search($hashId);

                $model = match ($paths->get($hashIndex - 1)) {
                    'bookmark-collections' => BookmarkCollection::class,
                    'bookmark-items' => BookmarkItem::class,
                    'ideascale-profiles' => IdeascaleProfile::class,
                    'proposals' => Proposal::class,
                    default => null,
                };

                return (new HashIdService(new $model))->decode($hashId);
            } catch (Exception $e) {
                abort(404, 'No item found with this id!');
            }
        });

        Route::bind('ideascaleProfile', function ($hashId) {
            try {
                $locale = app()->getLocale();
                $model = match (Route::currentRouteName()) {
                    "{$locale}.ideascaleProfiles.show" => IdeascaleProfile::class,
                    default => null,
                };

                return (new HashIdService(new $model))->decode($hashId);
            } catch (Exception $e) {
                abort(404, 'No item found with this id!');
            }
        });
    }

    /**
     * Bootstrap services.
     */
    public function boot(Router $router): void {}
}

<?php

declare(strict_types=1);

namespace App\Providers;

use App\Models\BookmarkCollection;
use App\Models\IdeascaleProfile;
use App\Models\Proposal;
use App\Models\Review;
use App\Services\HashIdService;
use Exception;
use Illuminate\Routing\Router;
use Illuminate\Support\Facades\Route;
use Illuminate\Support\ServiceProvider;
use Illuminate\Support\Str;

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
        Route::bind('hash', function ($hashId) {
            try {
                return $this->decodeHash($hashId);
            } catch (Exception) {
                abort(404, 'No item found for this hash!');
            }
        });

        Route::bind('ideascaleProfile', function ($hashId) {
            try {
                return (new HashIdService(new IdeascaleProfile))->decode($hashId);
            } catch (Exception) {
                abort(404, 'No item found for this hash!');
            }
        });

        Route::bind('proposal', function ($hashId) {

            try {
                return (new HashIdService(new Proposal))->decode($hashId);
            } catch (Exception) {
                abort(404, 'No item found for this hash!');
            }
        });

        Route::bind('review', function ($hashId) {
            try {
                return (new HashIdService(new Review))->decode($hashId);
            } catch (Exception) {
                abort(404, 'No item found for this hash!');
            }
        });
    }

    /**
     * Bootstrap services.
     */
    public function boot(Router $router): void {}

    protected function decodeHash(string $hashId): int|string
    {
        $paths = collect(explode('/', request()->path()));
        $hashIndex = $paths->search($hashId);

        $collection = $paths->get($hashIndex - 1);
        $model = Str::of($collection)->singular()->studly()->value();
        $class = "App\Models\\{$model}";

        if (! class_exists($class)) {
            return $hashId;
        }

        $model = match ($collection) {
            'bookmark-collections' => BookmarkCollection::class,
            default => $class,
        };

        return (new HashIdService(new $model))->decode($hashId);
    }
}

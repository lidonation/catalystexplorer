<?php

declare(strict_types=1);

namespace App\DataTransferObjects;

use Illuminate\Contracts\Pagination\CursorPaginator;
use Illuminate\Contracts\Pagination\Paginator;
use Illuminate\Pagination\AbstractCursorPaginator;
use Illuminate\Pagination\AbstractPaginator;
use Illuminate\Support\Collection;
use Illuminate\Support\Enumerable;
use Illuminate\Support\Facades\Gate;
use Illuminate\Support\LazyCollection;
use Spatie\LaravelData\Attributes\DataCollectionOf;
use Spatie\LaravelData\CursorPaginatedDataCollection;
use Spatie\LaravelData\Data;
use Spatie\LaravelData\DataCollection;
use Spatie\LaravelData\Optional;
use Spatie\LaravelData\PaginatedDataCollection;
use Spatie\TypeScriptTransformer\Attributes\TypeScript;

#[TypeScript]
class UserData extends Data
{
    public function __construct(
        public ?string $id,

        public ?string $name,

        public mixed $email,

        public ?string $lang,

        public ?string $hero_img_url,

        public ?string $email_verified_at,

        #[DataCollectionOf(LocationData::class)]
        public ?DataCollection $locations,

        #[DataCollectionOf(MediaData::class)]
        public ?DataCollection $media,

        public ?string $stake_address,

        public ?float $voting_power,

        public ?string $city,
    ) {}

    public static function from(...$payloads): static
    {
        $instance = parent::from(...$payloads);

        $user = collect($payloads)->first();

        if ($user && method_exists($user, 'getKey')) {
            $rawId = $user->getKey() ?? $user->id;

            $instance->id = $rawId !== null ? (string) $rawId : null;
        }

        if ($user && method_exists($user, 'getKey') && auth()->check()) {
            $canViewEmail = Gate::forUser(auth()->user())->allows('viewEmail', $user);

            if (! $canViewEmail) {
                $instance->email = Optional::create();
            }
        } elseif (! auth()->check()) {
            $instance->email = Optional::create();
        }

        return $instance;
    }

    public static function collect(mixed $items, ?string $into = null): DataCollection|PaginatedDataCollection|CursorPaginatedDataCollection|Enumerable|AbstractPaginator|Paginator|AbstractCursorPaginator|CursorPaginator|LazyCollection|Collection|array
    {
        $transformedItems = collect($items)->map(function ($item) {
            return static::from($item);
        });

        return parent::collect($transformedItems, $into);
    }
}

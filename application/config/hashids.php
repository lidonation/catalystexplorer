<?php

return [
    /*
    |--------------------------------------------------------------------------
    | Hashids Connections
    |--------------------------------------------------------------------------
    |
    | Here are each of the connections setup for your application. Example
    | configuration has been included, but you may add as many connections as
    | you would like.
    |
    */

    'connections' => [
        'default' => [
            'salt' => env('APP_KEY'),
            'length' => 11,
            'alphabet' => 'abcdefghijklmnopqrstuvwxyz0123456789',
        ],
        \App\Models\BookmarkCollection::class => [
            'salt' => \App\Models\BookmarkCollection::class.env('APP_KEY'),
            'length' => 11,
            'alphabet' => 'bcdefghijklmnopqrstuvwxyz0123456789',
        ],
        \App\Models\BookmarkItem::class => [
            'salt' => \App\Models\BookmarkItem::class.env('APP_KEY'),
            'length' => 11,
            'alphabet' => 'acdefghijklmnopqrstuvwxyz0123456789',
        ],
        \App\Models\Connection::class => [
            'salt' => \App\Models\Connection::class.env('APP_KEY'),
            'length' => 11,
            'alphabet' => 'abdefghijklmnopqrstuvwxyz0123456789',
        ],
        \App\Models\Group::class => [
            'salt' => \App\Models\Group::class.env('APP_KEY'),
            'length' => 11,
            'alphabet' => 'abcefghijklmnopqrstuvwxyz0123456789',
        ],
        \App\Models\IdeascaleProfile::class => [
            'salt' => \App\Models\IdeascaleProfile::class.env('APP_KEY'),
            'length' => 11,
            'alphabet' => 'abcdfghijklmnopqrstuvwxyz0123456789',
        ],
        \App\Models\Location::class => [
            'salt' => \App\Models\Location::class.env('APP_KEY'),
            'length' => 11,
            'alphabet' => 'abcdeghijklmnopqrstuvwxyz0123456789',
        ],
        \App\Models\Proposal::class => [
            'salt' => \App\Models\Proposal::class.env('APP_KEY'),
            'length' => 11,
            'alphabet' => 'abcdefhijklmnopqrstuvwxyz0123456789',
        ],
        \App\Models\Campaign::class => [
            'salt' => \App\Models\Campaign::class.env('APP_KEY'),
            'length' => 11,
            'alphabet' => 'abcdefgijklmnopqrstuvwxyz0123456789',
        ],
        \App\Models\Reviewer::class => [
            'salt' => \App\Models\Reviewer::class.env('APP_KEY'),
            'length' => 11,
            'alphabet' => 'abcdefghjklmnopqrstuvwxyz0123456789',
        ],
        \App\Models\Review::class => [
            'salt' => \App\Models\Review::class . env('APP_KEY'),
            'length' => 11,
            'alphabet' => 'abcdefghjklmnopqrstuvwxyz0123456789',
        ],
        \App\Models\User::class => [
            'salt' => \App\Models\User::class.env('APP_KEY'),
            'length' => 11,
            'alphabet' => 'abcdefghiklmnopqrstuvwxyz0123456789',
        ],
        \App\Models\Fund::class => [
            'salt' => \App\Models\Fund::class . env('APP_KEY'),
            'length' => 11,
            'alphabet' => 'abcdefghiklmnopqrstuvwxyz0123456789',
        ],
        \App\Models\CatalystDrep::class => [
            'salt' => \App\Models\CatalystDrep::class . env('APP_KEY'),
            'length' => 11,
            'alphabet' => 'abcdefghiklmnopqrstuvwxyz0123456789',
        ],
    ],
];

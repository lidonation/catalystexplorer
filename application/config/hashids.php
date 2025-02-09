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
        \App\Models\BookmarkCollection::class => [
            'salt' => \App\Models\BookmarkCollection::class.env('APP_KEY'),
            'length' => 11,
            'alphabet' => 'bcdefghijklmnopqrstuvwxyz0123456789',
        ],
        \App\Models\IdeascaleProfile::class => [
            'salt' => \App\Models\IdeascaleProfile::class.env('APP_KEY'),
            'length' => 11,
            'alphabet' => 'acdefghijklmnopqrstuvwxyz0123456789',
        ],
    ],
];

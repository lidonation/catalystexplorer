<?php

return [

    /*
    |--------------------------------------------------------------------------
    | Third Party Services
    |--------------------------------------------------------------------------
    |
    | This file is for storing the credentials for third party services such
    | as Mailgun, Postmark, AWS and more. This file provides the de facto
    | location for this type of information, allowing packages to have
    | a conventional file to locate the various service credentials.
    |
    */
    'fathom' => [
        'site_id' => env('FATHOM_SITE_ID', null),
    ],

    'postmark' => [
        'token' => env('POSTMARK_TOKEN'),
    ],

    'ses' => [
        'key' => env('AWS_ACCESS_KEY_ID'),
        'secret' => env('AWS_SECRET_ACCESS_KEY'),
        'region' => env('AWS_DEFAULT_REGION', 'us-east-1'),
    ],

    'resend' => [
        'key' => env('RESEND_KEY'),
    ],

    'slack' => [
        'notifications' => [
            'bot_user_oauth_token' => env('SLACK_BOT_USER_OAUTH_TOKEN'),
            'channel' => env('SLACK_BOT_USER_DEFAULT_CHANNEL'),
        ],
    ],

    'lido' => [
        'api_base_url' => env('LIDO_API_BASE_URL',),
        'api_key' => env('LIDO_API_KEY'),
    ],

    'govtools' => [
        'budget_proposals' => env('GOVTOOLS_BUDGET_PROPOSALS', ''),
    ],
    'blockfrost' => [
        'project_id' => env('BLOCKFROST_PROJECT_ID'),
        'base_url' => env('BLOCKFROST_BASE_URL', 'https://cardano-preprod.blockfrost.io/api/v0'),
        'baseUrlFallback' => env('BLOCKFROST_BASE_URL_FALLBACK', 'https://cardano-preprod.blockfrost.io/api/v0'),
    ],
];

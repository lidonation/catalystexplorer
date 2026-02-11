<?php

return [
    /*
    |--------------------------------------------------------------------------
    | Default Provider
    |--------------------------------------------------------------------------
    |
    | This option controls the default provider that will be used when no
    | provider is explicitly specified when generating embeddings.
    */

    'default' => env('AI_DEFAULT_PROVIDER', 'ollama'),

    /*
    |--------------------------------------------------------------------------
    | Embedding Providers
    |--------------------------------------------------------------------------
    |
    | Here you may configure the providers that your application uses for
    | generating embeddings. You may configure multiple providers and
    | switch between them as needed.
    */

    'providers' => [
        'ollama' => [
            'driver' => 'ollama',
            'host' => env('OLLAMA_HOST', 'http://localhost:11434'),
            'model' => env('OLLAMA_EMBEDDING_MODEL', 'nomic-embed-text'),
        ],

        'openai' => [
            'driver' => 'openai',
            'api_key' => env('OPENAI_API_KEY'),
            'model' => env('OPENAI_EMBEDDING_MODEL', 'text-embedding-3-small'),
        ],
    ],

    /*
    |--------------------------------------------------------------------------
    | Embedding Configuration
    |--------------------------------------------------------------------------
    |
    | Configuration for embedding generation and storage.
    */

    'embeddings' => [
        'dimensions' => [
            'nomic-embed-text' => 768,
            'mxbai-embed-large' => 1024,
            'text-embedding-3-small' => 1536,
            'text-embedding-3-large' => 3072,
        ],
        
        'chunk_size' => env('AI_CHUNK_SIZE', 1000),
        'chunk_overlap' => env('AI_CHUNK_OVERLAP', 200),
    ],
];
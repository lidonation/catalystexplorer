<!DOCTYPE html>
<html lang="{{ str_replace('_', '-', app()->getLocale()) }}" dir="{{ in_array(app()->getLocale(), ['ar']) ? 'rtl' : 'ltr' }}">
    <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1">
        <meta name="csrf-token" content="{{ csrf_token() }}">

        <title inertia>{{ isset($page['props']['proposal']['title']) ? $page['props']['proposal']['title'] . ' - Proposal' : config('app.name', 'CatalystExplorer') }}</title>
        
        @if(isset($page['props']['ogMeta']))
        {{-- Server-side OG meta tags for social media crawlers --}}
        <meta property="og:title" content="{{ $page['props']['proposal']['title'] ?? config('app.name') }}" inertia>
        <meta property="og:description" content="{{ $page['props']['ogMeta']['description'] ?? 'Explore Project Catalyst proposals' }}" inertia>
        <meta property="og:image" content="{{ $page['props']['ogMeta']['ogImageUrl'] ?? '' }}" inertia>
        <meta property="og:url" content="{{ $page['props']['ogMeta']['proposalUrl'] ?? url()->current() }}" inertia>
        <meta property="og:type" content="website" inertia>
        
        <meta name="twitter:card" content="summary_large_image" inertia>
        <meta name="twitter:title" content="{{ $page['props']['proposal']['title'] ?? config('app.name') }}" inertia>
        <meta name="twitter:description" content="{{ $page['props']['ogMeta']['description'] ?? 'Explore Project Catalyst proposals' }}" inertia>
        <meta name="twitter:image" content="{{ $page['props']['ogMeta']['ogImageUrl'] ?? '' }}" inertia>
        @endif

        <!-- Fonts -->
        <link rel="preconnect" href="https://fonts.bunny.net">
        <link href="https://fonts.bunny.net/css?family=figtree:400,500,600&display=swap" rel="stylesheet" />

        <!-- Scripts -->
        @routes
        @viteReactRefresh
        @vite([
          'resources/js/app.tsx',
          "resources/js/Pages/{$page['component']}.tsx"
         ])
        @inertiaHead

        @if(config('services.fathom.site_id'))
            <script src="https://cdn.usefathom.com/script.js" data-site="{{ config('services.fathom.site_id') }}" defer></script>
        @endif
    </head>
    <body class="font-sans antialiased">
        @inertia('app')
    </body>
</html>

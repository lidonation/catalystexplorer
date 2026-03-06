@php
    use Knuckles\Scribe\Tools\WritingUtils as u;
@endphp
<!doctype html>
<html lang="en" data-theme="light">
<head>
    <meta charset="utf-8">
    <meta content="IE=edge,chrome=1" http-equiv="X-UA-Compatible">
    <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1">
    <title>{!! $metadata['title'] !!}</title>

    <!-- CatalystExplorer Fonts -->
    <link rel="preconnect" href="https://fonts.bunny.net">
    <link href="https://fonts.bunny.net/css?family=figtree:400,500,600,700&display=swap" rel="stylesheet" />

    <!-- CatalystExplorer Styles -->
    <link rel="stylesheet" href="{{ asset('css/app.css') }}" media="screen">

    <!-- Documentation Styles -->
    <link rel="stylesheet" href="{!! $assetPathPrefix !!}css/theme-catalystexplorer.style.css" media="screen">
    <link rel="stylesheet" href="{!! $assetPathPrefix !!}css/theme-catalystexplorer.print.css" media="print">

    <script src="https://cdn.jsdelivr.net/npm/lodash@4.17.10/lodash.min.js"></script>

    <link rel="stylesheet"
          href="https://unpkg.com/@highlightjs/cdn-assets@11.6.0/styles/github.min.css">
    <script src="https://unpkg.com/@highlightjs/cdn-assets@11.6.0/highlight.min.js"></script>

    <script src="https://cdnjs.cloudflare.com/ajax/libs/jets/0.14.1/jets.min.js"></script>

@if(isset($metadata['example_languages']))
    <style id="language-style">
        /* starts out as display none and is replaced with js later  */
        @foreach($metadata['example_languages'] as $lang)
            body .content .{{ $lang }}-example code { display: none; }
        @endforeach
    </style>
@endif

@if($tryItOut['enabled'] ?? true)
    <script>
        var tryItOutBaseUrl = "{!! $tryItOut['base_url'] ?? $baseUrl !!}";
        var useCsrf = Boolean({!! $tryItOut['use_csrf'] ?? null !!});
        var csrfUrl = "{!! $tryItOut['csrf_url'] ?? null !!}";
    </script>
    <script src="{{ u::getVersionedAsset($assetPathPrefix.'js/tryitout.js') }}"></script>
@endif

    <!-- Theme toggle script -->
    <script>
        function toggleTheme() {
            const html = document.documentElement;
            const currentTheme = html.getAttribute('data-theme');
            const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
            html.setAttribute('data-theme', newTheme);
            localStorage.setItem('theme', newTheme);
        }

        // Load saved theme
        document.addEventListener('DOMContentLoaded', function() {
            const savedTheme = localStorage.getItem('theme') || 'light';
            document.documentElement.setAttribute('data-theme', savedTheme);
        });
    </script>

    <script src="{{ u::getVersionedAsset($assetPathPrefix.'js/theme-default.js') }}"></script>

</head>

<body class="font-sans antialiased bg-background text-content" data-languages="{{ json_encode($metadata['example_languages'] ?? []) }}">

    <!-- Header -->
    <header class="sticky top-0 z-50 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-b border-border-secondary">
        <div class="container max-w-7xl mx-auto px-4 lg:px-8">
            <div class="flex h-14 items-center justify-between">
                <div class="flex items-center space-x-4">
                    <a href="https://www.catalystexplorer.com" class="flex items-center space-x-2">
                        <div class="w-8 h-8 rounded-lg bg-gradient-to-br from-primary to-secondary flex items-center justify-center">
                            <span class="text-white font-bold text-sm">CE</span>
                        </div>
                        <span class="text-lg font-semibold text-primary">CatalystExplorer</span>
                    </a>
                    <span class="text-content-light text-sm">API Documentation</span>
                </div>
                
                <div class="flex items-center space-x-4">
                    <button onclick="toggleTheme()" class="p-2 rounded-lg hover:bg-background-darker transition-colors">
                        <svg class="w-5 h-5 text-content" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z"></path>
                        </svg>
                    </button>
                    <a href="https://github.com/lidonation/www.catalystexplorer.com" class="text-content hover:text-primary transition-colors">
                        <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M12 0C5.374 0 0 5.373 0 12 0 17.302 3.438 21.8 8.207 23.387c.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23A11.509 11.509 0 0112 5.803c1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576C20.566 21.797 24 17.3 24 12c0-6.627-5.373-12-12-12z"/>
                        </svg>
                    </a>
                </div>
            </div>
        </div>
    </header>

    <div class="flex">
        <!-- Sidebar -->
        @include("scribe::themes.catalystexplorer.sidebar")

        <!-- Main Content -->
        <div class="flex-1 min-h-screen">
            <div class="max-w-none xl:max-w-4xl mx-auto">
                <!-- Content area -->
                <div class="content prose prose-slate max-w-none px-6 py-8 xl:px-12">
                    {!! $intro !!}

                    {!! $auth !!}

                    @include("scribe::themes.catalystexplorer.groups")

                    {!! $append !!}
                </div>

                <!-- Code examples area -->
                @if(isset($metadata['example_languages']))
                <div class="fixed top-14 right-0 w-1/2 h-screen bg-gray-900 overflow-y-auto hidden xl:block">
                    <div class="sticky top-0 bg-gray-800 p-4 border-b border-gray-700">
                        <div class="flex space-x-2">
                            @foreach($metadata['example_languages'] as $name => $lang)
                                @php if (is_numeric($name)) $name = $lang; @endphp
                                <button type="button" class="lang-button px-3 py-1 text-sm rounded-md bg-gray-700 text-gray-300 hover:bg-gray-600 transition-colors" data-language-name="{{$lang}}">{{$name}}</button>
                            @endforeach
                        </div>
                    </div>
                </div>
                @endif
            </div>
        </div>
    </div>

    <style>
        @media (min-width: 1280px) {
            .content {
                width: 50%;
            }
        }
    </style>
</body>
</html>
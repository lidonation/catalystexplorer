<!DOCTYPE html>
<html lang="en" data-theme="light">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>CatalystExplorer API Documentation</title>
    <link rel="preconnect" href="https://fonts.bunny.net">
    <link href="https://fonts.bunny.net/css?family=figtree:400,500,600,700&display=swap" rel="stylesheet" />
    @vite(['resources/scss/app.scss'])
    <style>
        .endpoint {
            border: 1px solid var(--cx-border-secondary-color);
            border-radius: 8px;
            padding: 1.5rem;
            margin-bottom: 2rem;
            background: var(--cx-background);
        }

        .http-method {
            display: inline-flex;
            align-items: center;
            padding: 0.25rem 0.75rem;
            border-radius: 4px;
            font-size: 0.75rem;
            font-weight: 600;
            text-transform: uppercase;
        }

        .http-get {
            background-color: #dcfce7;
            color: #166534;
        }

        .http-post {
            background-color: #dbeafe;
            color: #1d4ed8;
        }

        .http-put {
            background-color: #fef3c7;
            color: #a16207;
        }

        .http-delete {
            background-color: #fee2e2;
            color: #dc2626;
        }

        [data-theme="dark"] .http-get {
            background-color: rgba(22, 163, 74, 0.2);
            color: #4ade80;
        }

        [data-theme="dark"] .http-post {
            background-color: rgba(29, 78, 216, 0.2);
            color: #60a5fa;
        }

        [data-theme="dark"] .http-put {
            background-color: rgba(161, 98, 7, 0.2);
            color: #fbbf24;
        }

        [data-theme="dark"] .http-delete {
            background-color: rgba(220, 38, 38, 0.2);
            color: #f87171;
        }

        .sidebar {
            background: var(--cx-background-darker);
            border-right: 1px solid var(--cx-border-secondary-color);
        }

        .docs-container {
            min-height: 100vh;
            background: var(--cx-background);
            color: var(--cx-content);
        }

        .docs-header {
            background: var(--cx-background);
            border-bottom: 1px solid var(--cx-border-secondary-color);
            position: sticky;
            top: 0;
            z-index: 50;
        }

        .docs-content {
            max-width: 4rem;
            margin: 0 auto;
            padding: 2rem;
        }
    </style>
</head>
<body class="font-sans antialiased bg-background text-content">
<!-- Header -->
<header class="sticky top-0 z-50 bg-background/95 backdrop-blur border-b border-border-secondary">
    <div class="container max-w-7xl mx-auto px-4 lg:px-8">
        <div class="flex h-16 items-center justify-between">
            <div class="flex items-center space-x-4">
                <a href="https://www.catalystexplorer.com" class="flex items-center space-x-2">
                    <div
                        class="w-8 h-8 rounded-lg bg-gradient-to-br from-primary to-secondary flex items-center justify-center">
                        <span class="text-white font-bold text-sm">CE</span>
                    </div>
                    <span class="text-xl font-semibold text-primary">CatalystExplorer</span>
                </a>
                <span class="text-content text-sm">API Documentation</span>
            </div>

            <div class="flex items-center space-x-4">
                <button onclick="toggleTheme()" class="p-2 rounded-lg hover:bg-background-darker transition-colors">
                    <svg class="w-5 h-5 text-content" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                              d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z"></path>
                    </svg>
                </button>
                <a href="https://github.com/lidonation/www.catalystexplorer.com"
                   class="text-content hover:text-primary transition-colors">
                    <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                        <path
                            d="M12 0C5.374 0 0 5.373 0 12 0 17.302 3.438 21.8 8.207 23.387c.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23A11.509 11.509 0 0112 5.803c1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576C20.566 21.797 24 17.3 24 12c0-6.627-5.373-12-12-12z" />
                    </svg>
                </a>
            </div>
        </div>
    </div>
</header>

<div class="flex">
    <!-- Sidebar -->
    <div class="sidebar w-80 flex-shrink-0 h-screen sticky top-16 overflow-y-auto">
        <div class="p-6">
            <nav>
                <ul class="space-y-1">
                    <li>
                        <a href="#introduction"
                           class="block px-3 py-2 text-sm font-medium text-content hover:text-primary hover:bg-background-light/10 rounded-md transition-colors">
                            Introduction
                        </a>
                    </li>
                    <li>
                        <a href="#authentication"
                           class="block px-3 py-2 text-sm font-medium text-content hover:text-primary hover:bg-background-light/10 rounded-md transition-colors">
                            Authentication
                        </a>
                    </li>
                    <li>
                        <a href="#errors"
                           class="block px-3 py-2 text-sm font-medium text-content hover:text-primary hover:bg-background-light/10 rounded-md transition-colors">
                            Error Handling
                        </a>
                    </li>
                    <li>
                        <a href="#pagination"
                           class="block px-3 py-2 text-sm font-medium text-content hover:text-primary hover:bg-background-light/10 rounded-md transition-colors">
                            Pagination
                        </a>
                    </li>
                    <li>
                        <a href="#proposals"
                           class="block px-3 py-2 text-sm font-medium text-content hover:text-primary hover:bg-background-light/10 rounded-md transition-colors">
                            Proposals
                        </a>
                    </li>
                    <li>
                        <a href="#funds"
                           class="block px-3 py-2 text-sm font-medium text-content hover:text-primary hover:bg-background-light/10 rounded-md transition-colors">
                            Funds & Campaigns
                        </a>
                    </li>
                    <li>
                        <a href="#community"
                           class="block px-3 py-2 text-sm font-medium text-content hover:text-primary hover:bg-background-light/10 rounded-md transition-colors">
                            Community
                        </a>
                    </li>
                    <li>
                        <a href="#downloads"
                           class="block px-3 py-2 text-sm font-medium text-content hover:text-primary hover:bg-background-light/10 rounded-md transition-colors">
                            Downloads
                        </a>
                    </li>
                </ul>
            </nav>
        </div>
    </div>

    <!-- Main Content -->
    <div class="flex-1 max-w-4xl mx-auto px-6 py-8">
        @include('docs.sections.introduction')

        @include('docs.sections.authentication')

        @include('docs.sections.errors')

        @include('docs.sections.pagination')

        @include('docs.sections.proposals')
        @include('docs.sections.funds')
        @include('docs.sections.community')
        @include('docs.sections.downloads')
    </div>
</div>

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
</body>
</html>

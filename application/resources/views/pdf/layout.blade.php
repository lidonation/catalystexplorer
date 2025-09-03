<!DOCTYPE html>
<html lang="{{ str_replace('_', '-', app()->getLocale()) }}">
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <title>{{ $title ?? config('app.name', 'Laravel') }}</title>
    
    {{-- Include Tailwind CSS --}}
    @vite(['resources/scss/app.scss', 'resources/scss/pdf.scss'])
    
    @stack('styles')
</head>
<body class="font-sans text-gray-800 bg-white text-xs leading-relaxed">
    <header class="pdf-header mb-5">
        @include('pdf.components.header', [
            'title' => $title ?? 'Document Title',
            'subtitle' => $subtitle ?? '',
            'date' => $date ?? now()->format('F j, Y'),
            'logo' => $logo ?? true
        ])
    </header>

    <main class="pdf-content min-h-[500px]">
        @yield('content')
    </main>

    <footer class="pdf-footer mt-5">
        @include('pdf.components.footer', [
            'company' => $company ?? config('app.name'),
            'website' => $website ?? config('app.url'),
            'email' => $email ?? config('mail.from.address'),
            'show_page_numbers' => $show_page_numbers ?? true
        ])
    </footer>

    @stack('scripts')
</body>
</html>

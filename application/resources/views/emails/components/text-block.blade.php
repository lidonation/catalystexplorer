@php
    $class = match($type ?? 'body') {
        'greeting' => 'text greeting',
        'body' => 'text body-text',
        'signature' => 'text signature',
        default => 'text'
    };
    
    $content = $content ?? '';
    
    $content = html_entity_decode($content, ENT_QUOTES, 'UTF-8');
    
    $containsHtml = preg_match('/<[^>]*>/', $content);
@endphp

<div class="{{ $class }}">
    @if($containsHtml)
        {!! $content !!}
    @else
        {!! Illuminate\Mail\Markdown::parse($content) !!}
    @endif
</div>
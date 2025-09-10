@php
    $defaultStyles = [
        'footer' => [
            'background-color' => '#0891b2',
            'color' => 'white',
            'padding' => '5px 20px',
            'border-radius' => '73px',
            'font-size' => '14px',
            'font-weight' => '400',
            'min-width' => 'auto'
        ],
        'default' => [
            'background-color' => '#0891b2',
            'color' => 'white',
            'padding' => '12px 30px',
            'border-radius' => '8px',
            'font-size' => '16px',
            'font-weight' => '500',
            'min-width' => '200px'
        ]
    ];

    $stylePreset = $preset ?? 'default';
    $buttonStyles = array_merge($defaultStyles[$stylePreset], $styles ?? []);
    
    $styleString = '';
    foreach ($buttonStyles as $property => $value) {
        $styleString .= "{$property}: {$value}; ";
    }

    $buttonText = $text ?? 'Click Here';
    if (isset($markdown) && $markdown === true) {
        $buttonText = Illuminate\Mail\Markdown::parse($buttonText);
        $buttonText = preg_replace('/<\/?p[^>]*>/', '', $buttonText);
    }
@endphp

<div class="button-container" style="text-align: center; margin: 20px 0; {{ $containerStyle ?? '' }}">
    <a href="{{ $url }}" class="button" style="
        {{ $styleString }}
        text-decoration: none;
        display: inline-block;
        font-family: Inter, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
        line-height: 1.4;
        text-align: center;
        white-space: nowrap;
        {{ $style ?? '' }}
    ">
        {!! $buttonText !!}
    </a>
</div>

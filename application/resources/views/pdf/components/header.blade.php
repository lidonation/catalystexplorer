<div class="flex justify-between items-start w-full py-2">
    <div class="flex-1">
        @if($logo)
            <div class="logo">
                {{-- You can replace this with an actual image or SVG logo --}}
                <div class="logo-placeholder">
                    <span>{{ config('app.name', 'LOGO') }}</span>
                </div>
            </div>
        @endif
    </div>
    
    <div class="flex-[2] text-center">
        <h1 class="text-lg font-bold text-slate-700 mb-1">{{ $title }}</h1>
        @if($subtitle)
            <h2 class="text-sm text-gray-600 font-normal">{{ $subtitle }}</h2>
        @endif
    </div>
    
    <div class="flex-1 text-right">
        <div class="text-2xs text-gray-600">
            <div class="mb-0.5">{{ $date }}</div>
            @if(isset($reference))
                <div class="mb-0.5">Ref: {{ $reference }}</div>
            @endif
            @if(isset($version))
                <div class="mb-0.5">Version: {{ $version }}</div>
            @endif
        </div>
    </div>
</div>

<hr class="header-divider">

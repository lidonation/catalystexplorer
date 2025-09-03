<hr class="footer-divider">

<div class="flex justify-between items-start w-full py-2 text-2xs text-gray-600">
    <div class="flex-1">
        <div class="company-info">
            <div class="font-bold mb-1">{{ $company }}</div>
            @if(isset($address))
                <div class="mb-1">{{ $address }}</div>
            @endif
            <div class="mt-1">
                @if($website)
                    <span>{{ $website }}</span>
                @endif
                @if($email && $website)
                    <span class="text-gray-400"> | </span>
                @endif
                @if($email)
                    <span>{{ $email }}</span>
                @endif
            </div>
        </div>
    </div>
    
    <div class="flex-1 text-center">
        <div class="font-bold mb-1">
            © {{ date('Y') }} {{ $company }}. All rights reserved.
        </div>
        @if(isset($confidential) && $confidential)
            <div class="confidential-notice">CONFIDENTIAL</div>
        @endif
    </div>
    
    <div class="flex-1 text-right">
        @if($show_page_numbers)
            <div class="mb-1">
                <span>Page <span class="pagenum"></span></span>
                @if(isset($total_pages))
                    <span> of {{ $total_pages }}</span>
                @endif
            </div>
        @endif
        @if(isset($generated_at))
            <div class="italic">Generated: {{ $generated_at }}</div>
        @else
            <div class="italic">Generated: {{ now()->format('M j, Y \a\t g:i A') }}</div>
        @endif
    </div>
</div>

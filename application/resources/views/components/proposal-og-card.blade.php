@php
    $textPrimary = isset($theme['textColorClass']) && $theme['textColorClass'] === 'dark' ? 'text-gray-persist/[0.5]' : 'text-white';
    $textSecondary = isset($theme['textColorClass']) && $theme['textColorClass'] === 'dark' ? 'text-light-gray-persist/[0.3]' : 'text-white/70';
    $voteBadgeText = isset($theme['textColorClass']) && $theme['textColorClass'] === 'dark' ? 'text-gray-persist/[0.3]' : 'text-white/80';
@endphp
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <script src="https://cdn.tailwindcss.com"></script>
    <style>
        body {
            margin: 0;
            padding: 0;
            width: 1200px;
            height: 630px;
            overflow: hidden;
        }
        .gradient-custom {
            background: {{ $theme['css'] }};
        }
    </style>
</head>
<body>
    <div class="w-full h-full flex items-center justify-center p-[40px]">
        <header class="{{ $textPrimary }} w-full h-full rounded-[24px] gradient-custom flex flex-col justify-between p-[40px]">
            {{-- Top Section: Meta + Title --}}
            <div class="flex flex-col gap-[40px]">
                {{-- Meta Bar: Budget, Open Source Badge, Duration --}}
                <div class="flex items-center justify-between">
                    <div class="flex items-center gap-[20px]">
                        {{-- Budget Badge --}}
                        <div class="inline-flex items-center">
                            <span class="font-semibold text-[28px] leading-[28px]">Budget {{ $formattedBudget }}</span>
                        </div>

                        {{-- Open Source Badge --}}
                        @if(isset($config['visibleElements']) && in_array('openSourceBadge', $config['visibleElements']) && $proposal->opensource)
                        <div class="inline-flex items-center gap-[8px] rounded-full px-[20px] py-[18px] bg-[#16b364]">
                            <svg class="w-[22px] h-[22px]" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                                <path fill-rule="evenodd" d="M12.316 3.051a1 1 0 01.633 1.265l-4 12a1 1 0 11-1.898-.632l4-12a1 1 0 011.265-.633zM5.707 6.293a1 1 0 010 1.414L3.414 10l2.293 2.293a1 1 0 11-1.414 1.414l-3-3a1 1 0 010-1.414l3-3a1 1 0 011.414 0zm8.586 0a1 1 0 011.414 0l3 3a1 1 0 010 1.414l-3 3a1 1 0 11-1.414-1.414L16.586 10l-2.293-2.293a1 1 0 010-1.414z" clip-rule="evenodd"/>
                            </svg>
                            <span class="font-medium text-[24px] leading-[24px]">Open Source</span>
                        </div>
                        @endif
                    </div>

                    {{-- Project Length --}}
                    @if($proposal->project_length)
                    <div class="text-right">
                        <span class="text-[24px] leading-[28px] {{ $textSecondary }} ">Duration: </span>
                        <span class="font-medium text-[24px] leading-[28px]">{{ $formattedLength }}</span>
                    </div>
                    @endif
                </div>

                {{-- Proposal Title --}}
                <div class="flex items-start">
                    <h1 class="text-[36px] font-bold line-clamp-2 w-full">
                        {{ $proposal->title }}
                    </h1>
                </div>
            </div>

            {{-- Vote Badge --}}
            @if(isset($config['visibleElements']) && in_array('myVote', $config['visibleElements']) && isset($config['voteChoice']) && $config['voteChoice'])
            <div class="flex items-center gap-[20px]">
                <span class="text-[28px] leading-[28px] {{ $textSecondary }}">My Vote:</span>
                @php
                    $voteClasses = match($config['voteChoice']) {
                        'yes' => 'border-[rgba(22,179,100,0.2)] bg-[#e0ffef] text-[#16b364]',
                        'no' => 'border-red-500/20 bg-red-100 text-red-500',
                        default => 'border-gray-400/20 bg-gray-100 text-gray-500'
                    };
                @endphp
                <div class="inline-flex items-center gap-[10px] rounded-[12px] px-[12px] py-[12px] font-medium border {{ $voteClasses }}">
                    @if($config['voteChoice'] === 'yes')
                    <svg class="w-[22px] h-[22px]" fill="currentColor" viewBox="0 0 20 20"><path d="M2 10.5a1.5 1.5 0 113 0v6a1.5 1.5 0 01-3 0v-6zM6 10.333v5.43a2 2 0 001.106 1.79l.05.025A4 4 0 008.943 18h5.416a2 2 0 001.962-1.608l1.2-6A2 2 0 0015.56 8H12V4a2 2 0 00-2-2 1 1 0 00-1 1v.667a4 4 0 01-.8 2.4L6.8 7.933a4 4 0 00-.8 2.4z"/></svg>
                    @elseif($config['voteChoice'] === 'no')
                    <svg class="w-[22px] h-[22px]" fill="currentColor" viewBox="0 0 20 20"><path d="M18 9.5a1.5 1.5 0 11-3 0v-6a1.5 1.5 0 013 0v6zM14 9.667v-5.43a2 2 0 00-1.106-1.79l-.05-.025A4 4 0 0011.057 2H5.64a2 2 0 00-1.962 1.608l-1.2 6A2 2 0 004.44 12H8v4a2 2 0 002 2 1 1 0 001-1v-.667a4 4 0 01.8-2.4l1.4-1.866a4 4 0 00.8-2.4z"/></svg>
                    @endif
                    <span class="capitalize text-[22px] leading-[14px]">{{ $config['voteChoice'] }}</span>
                </div>
            </div>
            @endif

            {{-- Custom Message --}}
            @if(isset($config['customMessage']) && !empty($config['customMessage']))
            <div class="rounded-[20px] px-[20px] py-[20px] bg-[#445067] border border-[#565d6c]" style="background-color: rgba({{ hexdec(substr($theme['end'], 1, 2)) }}, {{ hexdec(substr($theme['end'], 3, 2)) }}, {{ hexdec(substr($theme['end'], 5, 2)) }}, 0.3);">
                <p class="text-[28px] leading-[36px] {{ $textSecondary }} italic line-clamp-2">{{ $config['customMessage'] }}</p>
            </div>
            @endif

            {{-- Bottom Section: Footer --}}
            <div class="flex flex-col gap-[40px]">
                {{-- Footer: Team, Fund/Campaign, Total Votes --}}
                <div class="flex items-center justify-between">
                    {{-- Identity Section --}}
                    <div class="flex items-center gap-[20px]">
                        @if(isset($config['visibleElements']) && in_array('logo', $config['visibleElements']) && $shouldShowLogo)
                        <div class="w-[76px] h-[76px] overflow-hidden rounded-full border-2 border-white shrink-0">
                            @if(isset($config['logoUrl']) && $config['logoUrl'])
                            <img src="{{ $config['logoUrl'] }}" alt="Logo" class="w-full h-full object-cover">
                            @endif
                        </div>
                        @endif
                        <div class="flex flex-col">
                            <span class="text-[28px] font-semibold {{ $textPrimary }}">
                                {{ $teamNames ?: '-' }}
                            </span>
                            @if(isset($config['visibleElements']) && in_array('campaignTitle', $config['visibleElements']))
                            <span class="text-[24px] font-medium {{ $textSecondary }}">
                                {{ $proposal->fund->label ?? $proposal->fund->title ?? '' }}
                                @if($proposal->campaign && $proposal->fund)
                                • {{ $proposal->campaign->title }}
                                @endif
                            </span>
                            @endif
                        </div>
                    </div>

                    {{-- Total Votes --}}
                    @if(isset($config['visibleElements']) && in_array('totalVotes', $config['visibleElements']))
                    <div class="flex flex-col items-center text-center">
                        <span class="text-[24px] font-medium {{ $textSecondary }}">Total Votes</span>
                        <span class="text-[32px] font-bold {{ $textPrimary }}">{{ number_format($totalVotes) }}</span>
                    </div>
                    @endif
                </div>
            </div>
        </header>
    </div>
</body>
</html>
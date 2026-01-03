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
        .gradient-complete {
            background: linear-gradient(to top right, rgb(34, 197, 94), rgb(22, 163, 74));
        }
        .gradient-default {
            background: linear-gradient(to top right, rgb(15, 23, 42), rgb(30, 41, 59));
        }
    </style>
</head>
<body>
    <div class="w-full h-full flex items-center justify-center p-8">
        <header class="text-white min-h-[10rem] w-full rounded-xl {{ $proposal->status === 'complete' ? 'gradient-complete' : 'gradient-default' }} flex flex-col justify-between p-8">
            <div class="flex items-center justify-between mb-6">
                <!-- Badges (Left) -->
                <div class="flex items-center gap-3">
                    <!-- Budget Badge -->
                    <div class="inline-flex items-center gap-2 rounded-full px-4 py-2 text-lg" style="background-color: rgba(255, 255, 255, 0.2);">
                        <span class="font-medium">Budget</span>
                        <span class="font-medium">{{ $formattedBudget }}</span>
                    </div>

                    <!-- Open Source Badge -->
                    @if($proposal->opensource)
                    <div class="inline-flex items-center gap-2 rounded-full px-4 py-2 text-lg" style="background-color: rgba(34, 197, 94, 0.3);">
                        <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                            <path fill-rule="evenodd" d="M12.316 3.051a1 1 0 01.633 1.265l-4 12a1 1 0 11-1.898-.632l4-12a1 1 0 011.265-.633zM5.707 6.293a1 1 0 010 1.414L3.414 10l2.293 2.293a1 1 0 11-1.414 1.414l-3-3a1 1 0 010-1.414l3-3a1 1 0 011.414 0zm8.586 0a1 1 0 011.414 0l3 3a1 1 0 010 1.414l-3 3a1 1 0 11-1.414-1.414L16.586 10l-2.293-2.293a1 1 0 010-1.414z" clip-rule="evenodd"/>
                        </svg>
                        <span class="font-medium">Open Source</span>
                    </div>
                    @endif
                </div>

                <!-- Project Length -->
                @if($proposal->project_length)
                <div class="text-right">
                    <div class="text-sm opacity-75">Length</div>
                    <div class="text-2xl font-bold">{{ $formattedLength }}</div>
                </div>
                @endif
            </div>

            <!-- Proposal Title -->
            <div class="flex-1 flex items-center pb-4">
                <h1 class="text-4xl font-bold leading-tight line-clamp-3">
                    {{ $proposal->title }}
                </h1>
            </div>

            <!-- Team Members, Fund and Campaign Labels -->
            <div class="flex justify-between items-center py-2 italic text-lg opacity-90">
                <!-- Team Members (Left) -->
                @php
                    $team = $proposal->team ? $proposal->team->map(fn($member) => $member->model)->filter() : collect();
                    $teamNames = [];

                    if ($team->count() > 0) {
                        // Get first two members
                        $firstTwo = $team->take(2);
                        foreach ($firstTwo as $member) {
                            $teamNames[] = $member->name ?? $member->username ?? 'Unknown';
                        }

                        // If there are more than 2 members, add "and friends"
                        if ($team->count() > 2) {
                            $teamText = implode(', ', $teamNames) . ' and friends';
                        } else {
                            $teamText = implode(', ', $teamNames);
                        }
                    }
                @endphp

                <div class="flex items-center gap-2">
                    @if(!empty($teamText))
                    <span>{{ $teamText }}</span>
                    @endif
                </div>

                <!-- Fund and Campaign (Right) -->
                <div class="flex items-center">
                    @if($proposal->fund)
                    <span>~ {{ $proposal->fund->label ?? $proposal->fund->title }}</span>
                    @endif

                    @if($proposal->campaign && $proposal->fund)
                    <span class="mx-2">•</span>
                    @endif

                    @if($proposal->campaign)
                    <span>{{ $proposal->campaign->title }}</span>
                    @endif
                </div>
            </div>
        </header>
    </div>
</body>
</html>

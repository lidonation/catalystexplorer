<div class="sidebar w-80 bg-background-darker border-r border-border-secondary flex-shrink-0 h-screen sticky top-14 overflow-y-auto">
    <div class="p-6">
        <!-- Search -->
        <div class="mb-6">
            <div class="relative">
                <input type="text" 
                       id="input-search" 
                       placeholder="Search endpoints..." 
                       class="w-full px-4 py-2 text-sm border border-border-secondary rounded-lg bg-background focus:ring-2 focus:ring-primary focus:border-primary outline-none">
                <svg class="absolute right-3 top-2.5 w-4 h-4 text-content-light" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path>
                </svg>
            </div>
        </div>

        <!-- Navigation -->
        <nav id="toc" data-jets="true">
            <ul class="space-y-1">
                @if(isset($isInteractive) && $isInteractive)
                    <li>
                        <a href="{{ ltrim($metadata['base_url'] ?? '', '/') . '#introduction' }}" 
                           class="block px-3 py-2 text-sm font-medium text-content hover:text-primary hover:bg-background-light/10 rounded-md transition-colors">
                            Introduction
                        </a>
                    </li>
                    @if($metadata['auth']['enabled'])
                    <li>
                        <a href="{{ ltrim($metadata['base_url'] ?? '', '/') . '#authentication' }}" 
                           class="block px-3 py-2 text-sm font-medium text-content hover:text-primary hover:bg-background-light/10 rounded-md transition-colors">
                            Authentication
                        </a>
                    </li>
                    @endif
                @else
                    <li>
                        <a href="#introduction" 
                           class="block px-3 py-2 text-sm font-medium text-content hover:text-primary hover:bg-background-light/10 rounded-md transition-colors">
                            Introduction
                        </a>
                    </li>
                    @if($metadata['auth']['enabled'])
                    <li>
                        <a href="#authentication" 
                           class="block px-3 py-2 text-sm font-medium text-content hover:text-primary hover:bg-background-light/10 rounded-md transition-colors">
                            Authentication
                        </a>
                    </li>
                    @endif
                @endif

                @foreach($groupedEndpoints as $groupName => $endpoints)
                <li class="pt-4 first:pt-0">
                    <div class="px-3 py-2 text-xs font-semibold text-content-light uppercase tracking-wider">
                        {{ $groupName }}
                    </div>
                    <ul class="mt-1 space-y-1">
                        @foreach($endpoints as $endpoint)
                        <li>
                            @if(isset($isInteractive) && $isInteractive)
                                <a href="{{ ltrim($metadata['base_url'] ?? '', '/') . '#' . \Knuckles\Scribe\Tools\WritingUtils::getAnchor($endpoint) }}"
                            @else
                                <a href="#{{ \Knuckles\Scribe\Tools\WritingUtils::getAnchor($endpoint) }}"
                            @endif
                               class="group flex items-start px-3 py-2 text-sm text-content hover:text-primary hover:bg-background-light/10 rounded-md transition-colors">
                                <span class="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-{{ strtolower($endpoint['methods'][0]) === 'get' ? 'green' : (strtolower($endpoint['methods'][0]) === 'post' ? 'blue' : (strtolower($endpoint['methods'][0]) === 'put' ? 'yellow' : (strtolower($endpoint['methods'][0]) === 'delete' ? 'red' : 'gray'))) }}-100 text-{{ strtolower($endpoint['methods'][0]) === 'get' ? 'green' : (strtolower($endpoint['methods'][0]) === 'post' ? 'blue' : (strtolower($endpoint['methods'][0]) === 'put' ? 'yellow' : (strtolower($endpoint['methods'][0]) === 'delete' ? 'red' : 'gray'))) }}-800 mr-2 flex-shrink-0">
                                    {{ $endpoint['methods'][0] }}
                                </span>
                                <span class="flex-1 break-words">{{ $endpoint['metadata']['title'] ?? $endpoint['uri'] }}</span>
                            </a>
                        </li>
                        @endforeach
                    </ul>
                </li>
                @endforeach
            </ul>
        </nav>
    </div>
</div>

<style>
/* HTTP Method colors */
.bg-get { background-color: rgb(220 252 231); }
.text-get { color: rgb(22 163 74); }
.bg-post { background-color: rgb(219 234 254); }
.text-post { color: rgb(29 78 216); }
.bg-put { background-color: rgb(254 249 195); }
.text-put { color: rgb(161 98 7); }
.bg-delete { background-color: rgb(254 226 226); }
.text-delete { color: rgb(220 38 38); }
.bg-patch { background-color: rgb(243 232 255); }
.text-patch { color: rgb(147 51 234); }

[data-theme="dark"] .bg-get { background-color: rgb(22 163 74 / 0.2); }
[data-theme="dark"] .text-get { color: rgb(74 222 128); }
[data-theme="dark"] .bg-post { background-color: rgb(29 78 216 / 0.2); }
[data-theme="dark"] .text-post { color: rgb(96 165 250); }
[data-theme="dark"] .bg-put { background-color: rgb(161 98 7 / 0.2); }
[data-theme="dark"] .text-put { color: rgb(251 191 36); }
[data-theme="dark"] .bg-delete { background-color: rgb(220 38 38 / 0.2); }
[data-theme="dark"] .text-delete { color: rgb(248 113 113); }
[data-theme="dark"] .bg-patch { background-color: rgb(147 51 234 / 0.2); }
[data-theme="dark"] .text-patch { color: rgb(196 181 253); }
</style>
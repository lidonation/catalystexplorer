@php
    use Knuckles\Scribe\Tools\WritingUtils as u;
@endphp
<div id="{{ u::getAnchor($endpoint) }}" class="endpoint mb-12 p-6 border border-border-secondary rounded-lg bg-background-light/30">
    <!-- Endpoint Header -->
    <div class="mb-6">
        <div class="flex items-center space-x-3 mb-3">
            @foreach($endpoint['methods'] as $method)
            <span class="inline-flex items-center px-3 py-1 rounded-md text-sm font-medium 
                @if(strtolower($method) === 'get') bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400
                @elseif(strtolower($method) === 'post') bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400
                @elseif(strtolower($method) === 'put') bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400
                @elseif(strtolower($method) === 'delete') bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400
                @elseif(strtolower($method) === 'patch') bg-purple-100 text-purple-800 dark:bg-purple-900/20 dark:text-purple-400
                @else bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400
                @endif">
                {{ strtoupper($method) }}
            </span>
            @endforeach
            <code class="px-3 py-1 text-sm bg-gray-100 dark:bg-gray-800 text-content rounded-md font-mono">
                {{ $endpoint['uri'] }}
            </code>
        </div>
        
        <h3 class="text-xl font-semibold text-content mb-2">
            {{ $endpoint['metadata']['title'] ?? 'Endpoint' }}
        </h3>
        
        @if($endpoint['metadata']['description'] ?? null)
        <p class="text-content-light text-base mb-4">
            {{ $endpoint['metadata']['description'] }}
        </p>
        @endif

        @if($endpoint['metadata']['authenticated'] ?? false)
        <div class="inline-flex items-center px-3 py-1 rounded-md text-sm bg-orange-100 text-orange-800 dark:bg-orange-900/20 dark:text-orange-400 mb-4">
            <svg class="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"></path>
            </svg>
            Requires authentication
        </div>
        @endif
    </div>

    <!-- URL Parameters -->
    @if(isset($endpoint['urlParameters']) && count($endpoint['urlParameters']))
    <div class="mb-6">
        <h4 class="text-lg font-medium text-content mb-3">URL Parameters</h4>
        <div class="space-y-3">
            @foreach($endpoint['urlParameters'] as $parameter => $details)
            <div class="border border-border-secondary rounded-lg p-4">
                <div class="flex items-center justify-between mb-2">
                    <span class="font-mono text-sm bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded text-content">{{ $parameter }}</span>
                    <div class="flex items-center space-x-2">
                        <span class="text-xs px-2 py-1 rounded bg-blue-100 dark:bg-blue-900/20 text-blue-800 dark:text-blue-400">
                            {{ $details['type'] ?? 'string' }}
                        </span>
                        @if($details['required'] ?? true)
                        <span class="text-xs px-2 py-1 rounded bg-red-100 dark:bg-red-900/20 text-red-800 dark:text-red-400">required</span>
                        @else
                        <span class="text-xs px-2 py-1 rounded bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-400">optional</span>
                        @endif
                    </div>
                </div>
                @if($details['description'] ?? null)
                <p class="text-sm text-content-light">{{ $details['description'] }}</p>
                @endif
            </div>
            @endforeach
        </div>
    </div>
    @endif

    <!-- Query Parameters -->
    @if(isset($endpoint['queryParameters']) && count($endpoint['queryParameters']))
    <div class="mb-6">
        <h4 class="text-lg font-medium text-content mb-3">Query Parameters</h4>
        <div class="space-y-3">
            @foreach($endpoint['queryParameters'] as $parameter => $details)
            <div class="border border-border-secondary rounded-lg p-4">
                <div class="flex items-center justify-between mb-2">
                    <span class="font-mono text-sm bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded text-content">{{ $parameter }}</span>
                    <div class="flex items-center space-x-2">
                        <span class="text-xs px-2 py-1 rounded bg-blue-100 dark:bg-blue-900/20 text-blue-800 dark:text-blue-400">
                            {{ $details['type'] ?? 'string' }}
                        </span>
                        @if($details['required'] ?? false)
                        <span class="text-xs px-2 py-1 rounded bg-red-100 dark:bg-red-900/20 text-red-800 dark:text-red-400">required</span>
                        @else
                        <span class="text-xs px-2 py-1 rounded bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-400">optional</span>
                        @endif
                    </div>
                </div>
                @if($details['description'] ?? null)
                <p class="text-sm text-content-light">{{ $details['description'] }}</p>
                @endif
                @if(isset($details['example']) && $details['example'] !== null)
                <div class="mt-2">
                    <span class="text-xs text-content-light">Example:</span>
                    <code class="text-xs bg-gray-100 dark:bg-gray-800 px-1 py-0.5 rounded ml-1">{{ $details['example'] }}</code>
                </div>
                @endif
            </div>
            @endforeach
        </div>
    </div>
    @endif

    <!-- Body Parameters -->
    @if(isset($endpoint['bodyParameters']) && count($endpoint['bodyParameters']))
    <div class="mb-6">
        <h4 class="text-lg font-medium text-content mb-3">Body Parameters</h4>
        <div class="space-y-3">
            @foreach($endpoint['bodyParameters'] as $parameter => $details)
            <div class="border border-border-secondary rounded-lg p-4">
                <div class="flex items-center justify-between mb-2">
                    <span class="font-mono text-sm bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded text-content">{{ $parameter }}</span>
                    <div class="flex items-center space-x-2">
                        <span class="text-xs px-2 py-1 rounded bg-blue-100 dark:bg-blue-900/20 text-blue-800 dark:text-blue-400">
                            {{ $details['type'] ?? 'string' }}
                        </span>
                        @if($details['required'] ?? false)
                        <span class="text-xs px-2 py-1 rounded bg-red-100 dark:bg-red-900/20 text-red-800 dark:text-red-400">required</span>
                        @else
                        <span class="text-xs px-2 py-1 rounded bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-400">optional</span>
                        @endif
                    </div>
                </div>
                @if($details['description'] ?? null)
                <p class="text-sm text-content-light">{{ $details['description'] }}</p>
                @endif
            </div>
            @endforeach
        </div>
    </div>
    @endif

    <!-- Example requests -->
    @if(isset($endpoint['examples']) && count($endpoint['examples']))
    <div class="xl:hidden mb-6">
        <h4 class="text-lg font-medium text-content mb-3">Example Request</h4>
        
        @if(isset($metadata['example_languages']))
        <div class="mb-3">
            <div class="flex space-x-2 border-b border-border-secondary">
                @foreach($metadata['example_languages'] as $name => $lang)
                    @php if (is_numeric($name)) $name = $lang; @endphp
                    <button type="button" class="lang-button px-3 py-2 text-sm font-medium border-b-2 border-transparent hover:border-primary transition-colors" data-language-name="{{$lang}}">{{ucfirst($name)}}</button>
                @endforeach
            </div>
        </div>
        @endif

        <div class="example-requests">
            @foreach($endpoint['examples'] as $example)
                @foreach($metadata['example_languages'] ?? [] as $language)
                <div class="{{ $language }}-example hidden">
                    <pre class="language-{{ $language }}"><code>{{ $example[$language] ?? '' }}</code></pre>
                </div>
                @endforeach
            @endforeach
        </div>
    </div>
    @endif

    <!-- Try It Out -->
    @if($tryItOut['enabled'] ?? false)
    <div class="mb-6">
        <h4 class="text-lg font-medium text-content mb-3">Try it out</h4>
        <button onclick="tryItOut('{{ u::getAnchor($endpoint) }}')" 
                class="px-4 py-2 bg-primary hover:bg-primary-dark text-white rounded-lg transition-colors">
            Send Request
        </button>
        <div id="tryout-{{ u::getAnchor($endpoint) }}" class="mt-4 hidden">
            <div class="bg-gray-100 dark:bg-gray-800 rounded-lg p-4">
                <div class="loading">Sending request...</div>
                <div class="result hidden"></div>
            </div>
        </div>
    </div>
    @endif
</div>

<style>
/* Code highlighting for examples that appear on mobile/tablet */
.xl\:hidden .example-requests pre {
    background: #f8f9fa;
    border: 1px solid #e9ecef;
    border-radius: 8px;
    padding: 1rem;
    overflow-x: auto;
}

[data-theme="dark"] .xl\:hidden .example-requests pre {
    background: #2d3748;
    border-color: #4a5568;
}

.xl\:hidden .example-requests code {
    font-family: 'SFMono-Regular', 'Monaco', 'Inconsolata', 'Roboto Mono', monospace;
    font-size: 0.875rem;
    line-height: 1.5;
}
</style>
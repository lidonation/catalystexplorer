<!-- Introduction -->
<section id="introduction" class="mb-12">
    <h1 class="text-3xl font-bold text-content mb-4">CatalystExplorer API Documentation</h1>
    <p class="text-lg text-content mb-6">
        Comprehensive API for exploring Project Catalyst proposals, funding data, and community insights.
    </p>

    <div class="bg-primary-dark border-l-4 border-primary p-4 mb-6">
        <h3 class="font-semibold mb-2 text-white">Base URL</h3>
        <code class="text-sm bg-background-darker px-2 py-1 rounded">{{ config('app.url') }}/api</code>
    </div>

    <div class="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
                <div class="text-center p-4 border border-border-secondary rounded-lg">
                    <div class="text-2xl font-bold text-primary">{{ $stats['endpoints'] ?? 15 }}</div>
                    <div class="text-sm text-content">API Endpoints</div>
                </div>
                <div class="text-center p-4 border border-border-secondary rounded-lg">
                    <div class="text-2xl font-bold text-primary">{{ $stats['groups'] ?? 4 }}</div>
                    <div class="text-sm text-content">Endpoint Groups</div>
                </div>
                <div class="text-center p-4 border border-border-secondary rounded-lg">
                    <div class="text-2xl font-bold text-primary">v1.0</div>
                    <div class="text-sm text-content">API Version</div>
                </div>
    </div>

    <div class="mb-8">
        <h3 class="text-lg font-semibold text-content mb-4">Getting Started</h3>
        <p class="text-content mb-4">
            The CatalystExplorer API provides programmatic access to Project Catalyst data including proposals, funding information, community insights, and voting outcomes. Most endpoints are publicly accessible and don't require authentication.
        </p>

        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div class="border border-border-secondary rounded-lg p-4">
                <h4 class="font-semibold text-content mb-2">✨ What You Can Access</h4>
                <ul class="text-sm text-content space-y-1">
                    <li>• 15,000+ Project Catalyst proposals</li>
                    <li>• 12+ funding rounds with detailed metrics</li>
                    <li>• Community profiles and reviews</li>
                    <li>• Voting outcomes and tallies</li>
                    <li>• Advanced filtering and search</li>
                </ul>
            </div>

            <div class="border border-border-secondary rounded-lg p-4">
                <h4 class="font-semibold text-content mb-2">🚀 Key Features</h4>
                <ul class="text-sm text-content space-y-1">
                    <li>• RESTful API design</li>
                    <li>• JSON responses</li>
                    <li>• Relationship includes</li>
                    <li>• Powerful query filtering</li>
                    <li>• Paginated results</li>
                </ul>
            </div>
        </div>
    </div>

    <div class="bg-background-card-light border border-border-secondary rounded-lg p-4">
        <h4 class="font-semibold text-content mb-2">💡 Quick Example</h4>
        <p class="text-sm text-content mb-3">Get the latest completed proposals with campaign information:</p>
        <div class="bg-background-darker rounded-lg p-3">
            <pre class="text-sm text-content overflow-scroll">
                <code>curl "{{ config('app.url') }}/api/v1/proposals?filter%5Bstatus%5D=complete&include=campaign,fund&sort=-funded_at&per_page=5"</code>
            </pre>
        </div>
    </div>
</section>

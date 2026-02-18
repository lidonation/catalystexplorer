<!-- Authentication -->
<section id="authentication" class="mb-12">
    <h2 class="text-2xl font-bold text-content border-b border-border-secondary pb-4 mb-8">
        Authentication
    </h2>
    <p class="text-lg text-content mb-6">
        Most endpoints in the CatalystExplorer API are publicly accessible and do not require authentication.
        However, some internal features require authentication.
        If you encounter an endpoint requiring authentication,
        they are not meant for 3rd party consumption for now.
    </p>

    <div class="bg-primary-darker border-l-4 border-primary p-4 mb-6">
        <h3 class="font-semibold text-content mb-2">Public Endpoints</h3>
        <p class="text-sm text-content">
            All proposal, fund, campaign, and community data endpoints are publicly accessible without authentication.
        </p>
    </div>

{{--    <h3 class="text-lg font-semibold text-content mb-4">Authenticated Endpoints</h3>--}}
{{--    <p class="text-content mb-4">Some endpoints require authentication using a Bearer token:</p>--}}

{{--    <div class="space-y-4 mb-6">--}}
{{--        <div class="border border-border-secondary rounded-lg p-4">--}}
{{--            <h4 class="font-semibold text-content mb-2">Bearer Token Authentication</h4>--}}
{{--            <p class="text-sm text-content mb-3">Include your API token in the Authorization header:</p>--}}
{{--            <div class="bg-background-darker rounded-lg p-3">--}}
{{--                <pre class="text-sm text-content"><code>Authorization: Bearer {your-api-token}</code></pre>--}}
{{--            </div>--}}
{{--        </div>--}}
{{--    </div>--}}

{{--    <h4 class="font-semibold text-content mb-3">Endpoints Requiring Authentication</h4>--}}
{{--    <ul class="list-disc list-inside text-content space-y-2 mb-6">--}}
{{--        <li>Bookmark management (<code class="bg-background-darker px-1 rounded">/api/bookmark-items/*</code>)</li>--}}
{{--        <li>User preferences (<code class="bg-background-darker px-1 rounded">/api/user/*</code>)</li>--}}
{{--        <li>Proposal rationale submission</li>--}}
{{--        <li>Community joining and interactions</li>--}}
{{--    </ul>--}}
</section>

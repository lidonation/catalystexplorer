<!-- Error Handling -->
<section id="errors" class="mb-12">
    <h2 class="text-2xl font-bold text-content border-b border-border-secondary pb-4 mb-8">
        Error Handling
    </h2>
    <p class="text-lg text-content mb-6">
        The CatalystExplorer API uses conventional HTTP response codes to indicate the success or failure of an API request.
    </p>

    <h3 class="text-lg font-semibold text-content mb-4">HTTP Status Codes</h3>
    <div class="space-y-4 mb-6">
        <div class="border border-border-secondary rounded-lg p-4">
            <div class="flex items-center space-x-3 mb-2">
                <span class="px-3 py-1 rounded text-sm font-medium bg-green-100 text-green-800">200</span>
                <span class="font-semibold text-content">OK</span>
            </div>
            <p class="text-sm text-content">Everything worked as expected.</p>
        </div>

        <div class="border border-border-secondary rounded-lg p-4">
            <div class="flex items-center space-x-3 mb-2">
                <span class="px-3 py-1 rounded text-sm font-medium bg-red-100 text-red-800">400</span>
                <span class="font-semibold text-content">Bad Request</span>
            </div>
            <p class="text-sm text-content">The request was unacceptable, often due to missing a required parameter.</p>
        </div>

        <div class="border border-border-secondary rounded-lg p-4">
            <div class="flex items-center space-x-3 mb-2">
                <span class="px-3 py-1 rounded text-sm font-medium bg-red-100 text-red-800">401</span>
                <span class="font-semibold text-content">Unauthorized</span>
            </div>
            <p class="text-sm text-content">No valid API key or session provided.</p>
        </div>

        <div class="border border-border-secondary rounded-lg p-4">
            <div class="flex items-center space-x-3 mb-2">
                <span class="px-3 py-1 rounded text-sm font-medium bg-red-100 text-red-800">404</span>
                <span class="font-semibold text-content">Not Found</span>
            </div>
            <p class="text-sm text-content">The requested resource doesn't exist.</p>
        </div>

        <div class="border border-border-secondary rounded-lg p-4">
            <div class="flex items-center space-x-3 mb-2">
                <span class="px-3 py-1 rounded text-sm font-medium bg-red-100 text-red-800">422</span>
                <span class="font-semibold text-content">Unprocessable Entity</span>
            </div>
            <p class="text-sm text-content">The request was well-formed but contains semantic errors (e.g., validation failures).</p>
        </div>

        <div class="border border-border-secondary rounded-lg p-4">
            <div class="flex items-center space-x-3 mb-2">
                <span class="px-3 py-1 rounded text-sm font-medium bg-red-100 text-red-800">500</span>
                <span class="font-semibold text-content">Internal Server Error</span>
            </div>
            <p class="text-sm text-content">Something went wrong on our end.</p>
        </div>
    </div>

    <h4 class="font-semibold text-content mb-3">Error Response Format</h4>
    <div class="bg-background-darker rounded-lg p-4 overflow-x-auto">
        <pre class="text-sm text-content"><code>{
  "message": "The given data was invalid.",
  "errors": {
    "per_page": [
      "The per page field must be an integer.",
      "The per page field must not be greater than 60."
    ]
  }
}</code></pre>
    </div>
</section>

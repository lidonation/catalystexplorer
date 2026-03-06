<!-- Pagination -->
<section id="pagination" class="mb-12">
    <h2 class="text-2xl font-bold text-content border-b border-border-secondary pb-4 mb-8">
        Pagination
    </h2>
    <p class="text-lg text-content mb-6">
        List endpoints return paginated results to ensure optimal performance. All paginated endpoints follow the same structure.
    </p>

    <h3 class="text-lg font-semibold text-content mb-4">Pagination Parameters</h3>
    <div class="space-y-4 mb-6">
        <div class="border border-border-secondary rounded-lg p-4">
            <div class="flex items-center justify-between mb-2">
                <span class="font-mono text-sm bg-background-darker px-2 py-1 rounded">page</span>
                <div class="flex items-center space-x-2">
                    <span class="text-xs px-2 py-1 rounded bg-blue-100 text-blue-800">integer</span>
                    <span class="text-xs px-2 py-1 rounded bg-background-darker text-content">optional</span>
                </div>
            </div>
            <p class="text-sm text-content mb-2">The page number to retrieve (starts at 1).</p>
            <p class="text-xs text-content"><strong>Default:</strong> <code class="bg-background-darker px-1 rounded">1</code></p>
        </div>

        <div class="border border-border-secondary rounded-lg p-4">
            <div class="flex items-center justify-between mb-2">
                <span class="font-mono text-sm bg-background-darker px-2 py-1 rounded">per_page</span>
                <div class="flex items-center space-x-2">
                    <span class="text-xs px-2 py-1 rounded bg-blue-100 text-blue-800">integer</span>
                    <span class="text-xs px-2 py-1 rounded bg-background-darker text-content">optional</span>
                </div>
            </div>
            <p class="text-sm text-content mb-2">The number of items to return per page (maximum 60).</p>
            <p class="text-xs text-content"><strong>Default:</strong> <code class="bg-background-darker px-1 rounded">24</code></p>
        </div>
    </div>

    <h4 class="font-semibold text-content mb-3">Response Structure</h4>
    <p class="text-content mb-4">All paginated responses include data, links, and meta objects:</p>
    <div class="bg-background-darker rounded-lg p-4 overflow-x-auto">
        <pre class="text-sm text-content"><code>{
  "data": [
    // Array of requested resources
  ],
  "links": {
    "first": "https://www.catalystexplorer.com/api/v1/proposals?page=1",
    "last": "https://www.catalystexplorer.com/api/v1/proposals?page=10",
    "prev": "https://www.catalystexplorer.com/api/v1/proposals?page=1",
    "next": "https://www.catalystexplorer.com/api/v1/proposals?page=3"
  },
  "meta": {
    "current_page": 2,
    "from": 25,
    "last_page": 10,
    "path": "https://www.catalystexplorer.com/api/v1/proposals",
    "per_page": 24,
    "to": 48,
    "total": 240
  }
}</code></pre>
    </div>
</section>

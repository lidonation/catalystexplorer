<!-- Funds -->
<section id="funds" class="mb-12">
    <h2 class="text-2xl font-bold text-content border-b border-border-secondary pb-4 mb-8">
        Funds
    </h2>

    <div class="endpoint">
        <div class="flex items-center justify-between mb-4">
            <div class="flex items-center space-x-3">
                <span class="http-method http-get">GET</span>
                <code class="text-sm font-mono">/api/v1/funds</code>
            </div>
            <span class="text-xs text-content bg-background-darker px-2 py-1 rounded">No auth required</span>
        </div>
        <h3 class="text-lg font-semibold mb-2">List Funds</h3>
        <p class="text-content mb-4">
            Retrieve a paginated list of Project Catalyst funding rounds with filtering and sorting options.
        </p>

        <!-- Query Parameters -->
        <div class="mb-6">
            <h4 class="font-semibold text-content mb-3">Query Parameters</h4>
            <div class="space-y-4">
                <div class="border border-border-secondary rounded p-3">
                    <div class="flex items-center justify-between mb-2">
                        <span class="font-mono text-sm bg-background-darker px-2 py-1 rounded">page</span>
                        <div class="flex items-center space-x-2">
                            <span class="text-xs px-2 py-1 rounded bg-blue-100 text-blue-800">integer</span>
                            <span class="text-xs px-2 py-1 rounded bg-background-darker text-content">optional</span>
                        </div>
                    </div>
                    <p class="text-sm text-content mb-2">The page number for pagination.</p>
                    <p class="text-xs text-content"><strong>Example:</strong> <code class="bg-background-darker px-1 rounded">1</code></p>
                </div>

                <div class="border border-border-secondary rounded p-3">
                    <div class="flex items-center justify-between mb-2">
                        <span class="font-mono text-sm bg-background-darker px-2 py-1 rounded">per_page</span>
                        <div class="flex items-center space-x-2">
                            <span class="text-xs px-2 py-1 rounded bg-blue-100 text-blue-800">integer</span>
                            <span class="text-xs px-2 py-1 rounded bg-background-darker text-content">optional</span>
                        </div>
                    </div>
                    <p class="text-sm text-content mb-2">Number of funds per page (maximum 60).</p>
                    <p class="text-xs text-content"><strong>Example:</strong> <code class="bg-background-darker px-1 rounded">20</code></p>
                </div>

                <div class="border border-border-secondary rounded p-3">
                    <div class="flex items-center justify-between mb-2">
                        <span class="font-mono text-sm bg-background-darker px-2 py-1 rounded">filter[status]</span>
                        <div class="flex items-center space-x-2">
                            <span class="text-xs px-2 py-1 rounded bg-green-100 text-green-800">string</span>
                            <span class="text-xs px-2 py-1 rounded bg-background-darker text-content">optional</span>
                        </div>
                    </div>
                    <p class="text-sm text-content mb-2">Filter by fund status.</p>
                    <p class="text-xs text-content mb-2"><strong>Allowed values:</strong> <code class="bg-background-darker px-1 rounded">upcoming</code>, <code class="bg-background-darker px-1 rounded">active</code>, <code class="bg-background-darker px-1 rounded">completed</code>, <code class="bg-background-darker px-1 rounded">cancelled</code></p>
                    <p class="text-xs text-content"><strong>Example:</strong> <code class="bg-background-darker px-1 rounded">completed</code></p>
                </div>

                <div class="border border-border-secondary rounded p-3">
                    <div class="flex items-center justify-between mb-2">
                        <span class="font-mono text-sm bg-background-darker px-2 py-1 rounded">filter[title]</span>
                        <div class="flex items-center space-x-2">
                            <span class="text-xs px-2 py-1 rounded bg-green-100 text-green-800">string</span>
                            <span class="text-xs px-2 py-1 rounded bg-background-darker text-content">optional</span>
                        </div>
                    </div>
                    <p class="text-sm text-content mb-2">Search funds by title (case insensitive).</p>
                    <p class="text-xs text-content"><strong>Example:</strong> <code class="bg-background-darker px-1 rounded">Fund 12</code></p>
                </div>

                <div class="border border-border-secondary rounded p-3">
                    <div class="flex items-center justify-between mb-2">
                        <span class="font-mono text-sm bg-background-darker px-2 py-1 rounded">include</span>
                        <div class="flex items-center space-x-2">
                            <span class="text-xs px-2 py-1 rounded bg-green-100 text-green-800">string</span>
                            <span class="text-xs px-2 py-1 rounded bg-background-darker text-content">optional</span>
                        </div>
                    </div>
                    <p class="text-sm text-content mb-2">Comma-separated list of relationships to include.</p>
                    <p class="text-xs text-content mb-2"><strong>Available includes:</strong> <code class="bg-background-darker px-1 rounded">campaigns</code>, <code class="bg-background-darker px-1 rounded">proposals</code>, <code class="bg-background-darker px-1 rounded">parent</code>, <code class="bg-background-darker px-1 rounded">children</code></p>
                    <p class="text-xs text-content"><strong>Example:</strong> <code class="bg-background-darker px-1 rounded">campaigns,proposals</code></p>
                </div>

                <div class="border border-border-secondary rounded p-3">
                    <div class="flex items-center justify-between mb-2">
                        <span class="font-mono text-sm bg-background-darker px-2 py-1 rounded">sort</span>
                        <div class="flex items-center space-x-2">
                            <span class="text-xs px-2 py-1 rounded bg-green-100 text-green-800">string</span>
                            <span class="text-xs px-2 py-1 rounded bg-background-darker text-content">optional</span>
                        </div>
                    </div>
                    <p class="text-sm text-content mb-2">Comma-separated list of fields to sort by. Prefix with - for descending order.</p>
                    <p class="text-xs text-content mb-2"><strong>Available fields:</strong> <code class="bg-background-darker px-1 rounded">title</code>, <code class="bg-background-darker px-1 rounded">amount</code>, <code class="bg-background-darker px-1 rounded">status</code>, <code class="bg-background-darker px-1 rounded">launched_at</code>, <code class="bg-background-darker px-1 rounded">created_at</code></p>
                    <p class="text-xs text-content"><strong>Example:</strong> <code class="bg-background-darker px-1 rounded">-launched_at,title</code></p>
                </div>
            </div>
        </div>

        <!-- Example Request -->
        <div class="mb-6">
            <h4 class="font-semibold text-content mb-3">Example Request</h4>
            <div class="bg-background-darker rounded-lg p-4 overflow-x-auto">
                <pre class="text-sm text-content"><code>GET /api/v1/funds?filter%5Bstatus%5D=completed&include=campaigns&sort=-launched_at&per_page=10</code></pre>
            </div>
        </div>

        <!-- Example Response -->
        <div class="mb-6">
            <h4 class="font-semibold text-content mb-3">Example Response</h4>
            <div class="bg-background-darker rounded-lg p-4 overflow-x-auto">
                <pre class="text-sm text-content"><code>{
  "data": [
    {
      "id": 12,
      "title": "Fund 12",
      "status": "completed",
      "amount": 50000000000,
      "launch_date": "2024-01-01",
      "proposals_count": 156,
      "funded_proposals_count": 89,
      "total_amount_awarded": 35000000000,
      "created_at": "2023-11-01T00:00:00Z",
      "updated_at": "2024-03-01T00:00:00Z",
      "campaigns": [
        {
          "id": 456,
          "title": "Developer Tools",
          "budget": 5000000000,
          "proposals_count": 45
        },
        {
          "id": 789,
          "title": "DeFi and Financial Services",
          "budget": 8000000000,
          "proposals_count": 32
        }
      ]
    }
  ],
  "links": {
    "first": "https://www.catalystexplorer.com/api/v1/funds?page=1",
    "last": "https://www.catalystexplorer.com/api/v1/funds?page=2",
    "prev": null,
    "next": "https://www.catalystexplorer.com/api/v1/funds?page=2"
  },
  "meta": {
    "current_page": 1,
    "from": 1,
    "last_page": 2,
    "per_page": 10,
    "to": 10,
    "total": 12
  }
}</code></pre>
            </div>
        </div>
    </div>

    <div class="endpoint">
        <div class="flex items-center justify-between mb-4">
            <div class="flex items-center space-x-3">
                <span class="http-method http-get">GET</span>
                <code class="text-sm font-mono">/api/v1/funds/{id}</code>
            </div>
            <span class="text-xs text-content bg-background-darker px-2 py-1 rounded">No auth required</span>
        </div>
        <h3 class="text-lg font-semibold mb-2">Get Fund Details</h3>
        <p class="text-content mb-4">
            Retrieve detailed information about a specific fund including statistics and optional related data.
        </p>

        <!-- URL Parameters -->
        <div class="mb-6">
            <h4 class="font-semibold text-content mb-3">URL Parameters</h4>
            <div class="border border-border-secondary rounded p-3">
                <div class="flex items-center justify-between mb-2">
                    <span class="font-mono text-sm bg-background-darker px-2 py-1 rounded">id</span>
                    <div class="flex items-center space-x-2">
                        <span class="text-xs px-2 py-1 rounded bg-blue-100 text-blue-800">integer</span>
                        <span class="text-xs px-2 py-1 rounded bg-red-100 text-red-800">required</span>
                    </div>
                </div>
                <p class="text-sm text-content mb-2">The fund ID.</p>
                <p class="text-xs text-content"><strong>Example:</strong> <code class="bg-background-darker px-1 rounded">12</code></p>
            </div>
        </div>

        <!-- Query Parameters -->
        <div class="mb-6">
            <h4 class="font-semibold text-content mb-3">Query Parameters</h4>
            <div class="border border-border-secondary rounded p-3">
                <div class="flex items-center justify-between mb-2">
                    <span class="font-mono text-sm bg-background-darker px-2 py-1 rounded">include</span>
                    <div class="flex items-center space-x-2">
                        <span class="text-xs px-2 py-1 rounded bg-green-100 text-green-800">string</span>
                        <span class="text-xs px-2 py-1 rounded bg-background-darker text-content">optional</span>
                    </div>
                </div>
                <p class="text-sm text-content mb-2">Comma-separated list of relationships to include.</p>
                <p class="text-xs text-content mb-2"><strong>Available includes:</strong> <code class="bg-background-darker px-1 rounded">campaigns</code>, <code class="bg-background-darker px-1 rounded">proposals</code>, <code class="bg-background-darker px-1 rounded">parent</code>, <code class="bg-background-darker px-1 rounded">children</code>, <code class="bg-background-darker px-1 rounded">statistics</code></p>
                <p class="text-xs text-content"><strong>Example:</strong> <code class="bg-background-darker px-1 rounded">campaigns,statistics</code></p>
            </div>
        </div>

        <!-- Example Request -->
        <div class="mb-6">
            <h4 class="font-semibold text-content mb-3">Example Request</h4>
            <div class="bg-background-darker rounded-lg p-4 overflow-x-auto">
                <pre class="text-sm text-content"><code>GET /api/v1/funds/12?include=campaigns,statistics</code></pre>
            </div>
        </div>

        <!-- Example Response -->
        <div class="mb-6">
            <h4 class="font-semibold text-content mb-3">Example Response</h4>
            <div class="bg-background-darker rounded-lg p-4 overflow-x-auto">
                <pre class="text-sm text-content"><code>{
  "data": {
    "id": 12,
    "title": "Fund 12",
    "status": "completed",
    "amount": 50000000000,
    "launch_date": "2024-01-01",
    "voting_power_threshold": 15000000,
    "proposals_count": 156,
    "funded_proposals_count": 89,
    "total_amount_awarded": 35000000000,
    "description": "The twelfth round of Project Catalyst funding...",
    "created_at": "2023-11-01T00:00:00Z",
    "updated_at": "2024-03-01T00:00:00Z",
    "campaigns": [
      {
        "id": 456,
        "title": "Developer Tools",
        "budget": 5000000000,
        "proposals_count": 45,
        "funded_proposals_count": 28
      },
      {
        "id": 789,
        "title": "DeFi and Financial Services",
        "budget": 8000000000,
        "proposals_count": 32,
        "funded_proposals_count": 18
      }
    ],
    "statistics": {
      "total_voters": 45230,
      "total_voting_power": 2500000000000,
      "participation_rate": 0.68,
      "average_proposal_amount": 320513,
      "success_rate": 0.57
    }
  }
}</code></pre>
            </div>
        </div>
    </div>

    <div class="endpoint">
        <div class="flex items-center justify-between mb-4">
            <div class="flex items-center space-x-3">
                <span class="http-method http-get">GET</span>
                <code class="text-sm font-mono">/api/v1/funds/{id}/campaigns</code>
            </div>
            <span class="text-xs text-content bg-background-darker px-2 py-1 rounded">No auth required</span>
        </div>
        <h3 class="text-lg font-semibold mb-2">Get Fund Campaigns</h3>
        <p class="text-content mb-4">
            Retrieve all campaigns belonging to a specific fund with pagination and filtering options.
        </p>

        <!-- URL Parameters -->
        <div class="mb-6">
            <h4 class="font-semibold text-content mb-3">URL Parameters</h4>
            <div class="border border-border-secondary rounded p-3">
                <div class="flex items-center justify-between mb-2">
                    <span class="font-mono text-sm bg-background-darker px-2 py-1 rounded">id</span>
                    <div class="flex items-center space-x-2">
                        <span class="text-xs px-2 py-1 rounded bg-blue-100 text-blue-800">integer</span>
                        <span class="text-xs px-2 py-1 rounded bg-red-100 text-red-800">required</span>
                    </div>
                </div>
                <p class="text-sm text-content mb-2">The fund ID.</p>
                <p class="text-xs text-content"><strong>Example:</strong> <code class="bg-background-darker px-1 rounded">12</code></p>
            </div>
        </div>

        <!-- Query Parameters -->
        <div class="mb-6">
            <h4 class="font-semibold text-content mb-3">Query Parameters</h4>
            <div class="space-y-4">
                <div class="border border-border-secondary rounded p-3">
                    <div class="flex items-center justify-between mb-2">
                        <span class="font-mono text-sm bg-background-darker px-2 py-1 rounded">page</span>
                        <div class="flex items-center space-x-2">
                            <span class="text-xs px-2 py-1 rounded bg-blue-100 text-blue-800">integer</span>
                            <span class="text-xs px-2 py-1 rounded bg-background-darker text-content">optional</span>
                        </div>
                    </div>
                    <p class="text-sm text-content mb-2">The page number for pagination.</p>
                    <p class="text-xs text-content"><strong>Example:</strong> <code class="bg-background-darker px-1 rounded">1</code></p>
                </div>

                <div class="border border-border-secondary rounded p-3">
                    <div class="flex items-center justify-between mb-2">
                        <span class="font-mono text-sm bg-background-darker px-2 py-1 rounded">include</span>
                        <div class="flex items-center space-x-2">
                            <span class="text-xs px-2 py-1 rounded bg-green-100 text-green-800">string</span>
                            <span class="text-xs px-2 py-1 rounded bg-background-darker text-content">optional</span>
                        </div>
                    </div>
                    <p class="text-sm text-content mb-2">Include related data.</p>
                    <p class="text-xs text-content mb-2"><strong>Available includes:</strong> <code class="bg-background-darker px-1 rounded">proposals</code>, <code class="bg-background-darker px-1 rounded">fund</code></p>
                    <p class="text-xs text-content"><strong>Example:</strong> <code class="bg-background-darker px-1 rounded">proposals</code></p>
                </div>
            </div>
        </div>

        <!-- Example Request -->
        <div class="mb-6">
            <h4 class="font-semibold text-content mb-3">Example Request</h4>
            <div class="bg-background-darker rounded-lg p-4 overflow-x-auto">
                <pre class="text-sm text-content"><code>GET /api/v1/funds/12/campaigns?include=proposals</code></pre>
            </div>
        </div>

        <!-- Example Response -->
        <div class="mb-6">
            <h4 class="font-semibold text-content mb-3">Example Response</h4>
            <div class="bg-background-darker rounded-lg p-4 overflow-x-auto">
                <pre class="text-sm text-content"><code>{
  "data": [
    {
      "id": 456,
      "title": "Developer Tools",
      "budget": 5000000000,
      "proposals_count": 45,
      "funded_proposals_count": 28,
      "total_amount_awarded": 3200000000,
      "proposals": [
        {
          "id": 123,
          "title": {
            "en": "DeFi Protocol Development"
          },
          "status": "funded",
          "amount_requested": 50000000
        }
      ]
    }
  ],
  "links": {
    "first": "https://www.catalystexplorer.com/api/v1/funds/12/campaigns?page=1",
    "last": "https://www.catalystexplorer.com/api/v1/funds/12/campaigns?page=3",
    "prev": null,
    "next": "https://www.catalystexplorer.com/api/v1/funds/12/campaigns?page=2"
  },
  "meta": {
    "current_page": 1,
    "from": 1,
    "last_page": 3,
    "per_page": 15,
    "to": 15,
    "total": 35
  }
}</code></pre>
            </div>
        </div>
    </div>
</section>

<!-- Proposals -->
<section id="proposals" class="mb-12">
    <h2 class="text-2xl font-bold text-content border-b border-border-secondary pb-4 mb-8">
        Proposals
    </h2>

    <div class="endpoint">
        <div class="flex items-center justify-between mb-4">
            <div class="flex items-center space-x-3">
                <span class="http-method http-get">GET</span>
                <code class="text-sm font-mono">/api/v1/proposals</code>
            </div>
            <span class="text-xs text-content bg-background-darker px-2 py-1 rounded">No auth required</span>
        </div>
        <h3 class="text-lg font-semibold mb-2">List Proposals</h3>
        <p class="text-content mb-4">
            Retrieve a paginated list of Project Catalyst proposals with advanced filtering, sorting, and relationship includes.
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
                    <p class="text-sm text-content mb-2">Number of proposals per page (maximum 60).</p>
                    <p class="text-xs text-content"><strong>Example:</strong> <code class="bg-background-darker px-1 rounded">24</code></p>
                </div>

                <div class="border border-border-secondary rounded p-3">
                    <div class="flex items-center justify-between mb-2">
                        <span class="font-mono text-sm bg-background-darker px-2 py-1 rounded">filter[id]</span>
                        <div class="flex items-center space-x-2">
                            <span class="text-xs px-2 py-1 rounded bg-blue-100 text-blue-800">integer</span>
                            <span class="text-xs px-2 py-1 rounded bg-background-darker text-content">optional</span>
                        </div>
                    </div>
                    <p class="text-sm text-content mb-2">Filter by exact proposal ID.</p>
                    <p class="text-xs text-content"><strong>Example:</strong> <code class="bg-background-darker px-1 rounded">123</code></p>
                </div>

                <div class="border border-border-secondary rounded p-3">
                    <div class="flex items-center justify-between mb-2">
                        <span class="font-mono text-sm bg-background-darker px-2 py-1 rounded">filter[title]</span>
                        <div class="flex items-center space-x-2">
                            <span class="text-xs px-2 py-1 rounded bg-green-100 text-green-800">string</span>
                            <span class="text-xs px-2 py-1 rounded bg-background-darker text-content">optional</span>
                        </div>
                    </div>
                    <p class="text-sm text-content mb-2">Search proposals by title (case insensitive).</p>
                    <p class="text-xs text-content"><strong>Example:</strong> <code class="bg-background-darker px-1 rounded">DeFi</code></p>
                </div>

                <div class="border border-border-secondary rounded p-3">
                    <div class="flex items-center justify-between mb-2">
                        <span class="font-mono text-sm bg-background-darker px-2 py-1 rounded">filter[status]</span>
                        <div class="flex items-center space-x-2">
                            <span class="text-xs px-2 py-1 rounded bg-green-100 text-green-800">string</span>
                            <span class="text-xs px-2 py-1 rounded bg-background-darker text-content">optional</span>
                        </div>
                    </div>
                    <p class="text-sm text-content mb-2">Filter by proposal status.</p>
                    <p class="text-xs text-content mb-2"><strong>Allowed values:</strong> <code class="bg-background-darker px-1 rounded">funded</code>, <code class="bg-background-darker px-1 rounded">unfunded</code>, <code class="bg-background-darker px-1 rounded">complete</code>, <code class="bg-background-darker px-1 rounded">over_budget</code></p>
                    <p class="text-xs text-content"><strong>Example:</strong> <code class="bg-background-darker px-1 rounded">funded</code></p>
                </div>

                <div class="border border-border-secondary rounded p-3">
                    <div class="flex items-center justify-between mb-2">
                        <span class="font-mono text-sm bg-background-darker px-2 py-1 rounded">filter[fund_id]</span>
                        <div class="flex items-center space-x-2">
                            <span class="text-xs px-2 py-1 rounded bg-blue-100 text-blue-800">integer</span>
                            <span class="text-xs px-2 py-1 rounded bg-background-darker text-content">optional</span>
                        </div>
                    </div>
                    <p class="text-sm text-content mb-2">Filter by fund ID.</p>
                    <p class="text-xs text-content"><strong>Example:</strong> <code class="bg-background-darker px-1 rounded">12</code></p>
                </div>

                <div class="border border-border-secondary rounded p-3">
                    <div class="flex items-center justify-between mb-2">
                        <span class="font-mono text-sm bg-background-darker px-2 py-1 rounded">filter[amount_min]</span>
                        <div class="flex items-center space-x-2">
                            <span class="text-xs px-2 py-1 rounded bg-blue-100 text-blue-800">integer</span>
                            <span class="text-xs px-2 py-1 rounded bg-background-darker text-content">optional</span>
                        </div>
                    </div>
                    <p class="text-sm text-content mb-2">Filter by minimum requested amount (in ADA lovelace).</p>
                    <p class="text-xs text-content"><strong>Example:</strong> <code class="bg-background-darker px-1 rounded">10000000</code> (10 ADA)</p>
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
                    <p class="text-xs text-content mb-2"><strong>Available includes:</strong> <code class="bg-background-darker px-1 rounded">campaign</code>, <code class="bg-background-darker px-1 rounded">user</code>, <code class="bg-background-darker px-1 rounded">fund</code>, <code class="bg-background-darker px-1 rounded">team</code>, <code class="bg-background-darker px-1 rounded">schedule</code>, <code class="bg-background-darker px-1 rounded">reviews</code></p>
                    <p class="text-xs text-content"><strong>Example:</strong> <code class="bg-background-darker px-1 rounded">campaign,fund,team</code></p>
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
                    <p class="text-xs text-content mb-2"><strong>Available fields:</strong> <code class="bg-background-darker px-1 rounded">title</code>, <code class="bg-background-darker px-1 rounded">status</code>, <code class="bg-background-darker px-1 rounded">amount_requested</code>, <code class="bg-background-darker px-1 rounded">funded_at</code>, <code class="bg-background-darker px-1 rounded">created_at</code></p>
                    <p class="text-xs text-content"><strong>Example:</strong> <code class="bg-background-darker px-1 rounded">-created_at,title</code></p>
                </div>
            </div>
        </div>

        <!-- Example Request -->
        <div class="mb-6">
            <h4 class="font-semibold text-content mb-3">Example Request</h4>
            <div class="bg-background-darker rounded-lg p-4 overflow-x-auto">
                <pre class="text-sm text-content"><code>GET /api/v1/proposals?page=1&per_page=10&filter%5Bstatus%5D=complete&include=campaign,fund&sort=-funded_at</code></pre>
            </div>
        </div>

        <!-- Example Response -->
        <div class="mb-6">
            <h4 class="font-semibold text-content mb-3">Example Response</h4>
            <div class="bg-background-darker rounded-lg p-4 overflow-x-auto">
                <pre class="text-sm text-content"><code>{
  "data": [
    {
      "id": 123,
      "title": {
        "en": "DeFi Protocol Development"
      },
      "status": "funded",
      "type": "project",
      "category": "developer-tools",
      "amount_requested": 50000000,
      "amount_received": 45000000,
      "funded_at": "2024-01-15T10:30:00Z",
      "yes_votes_count": 250,
      "no_votes_count": 15,
      "created_at": "2023-12-01T09:00:00Z",
      "updated_at": "2024-01-15T10:30:00Z",
      "campaign": {
        "id": 456,
        "title": "Developer Tools",
        "budget": 500000000
      },
      "fund": {
        "id": 12,
        "title": "Fund 12",
        "status": "completed"
      }
    }
  ],
  "links": {
    "first": "https://www.catalystexplorer.com/api/v1/proposals?page=1",
    "last": "https://www.catalystexplorer.com/api/v1/proposals?page=10",
    "prev": null,
    "next": "https://www.catalystexplorer.com/api/v1/proposals?page=2"
  },
  "meta": {
    "current_page": 1,
    "from": 1,
    "last_page": 10,
    "per_page": 10,
    "to": 10,
    "total": 95
  }
}</code></pre>
            </div>
        </div>
    </div>

    <div class="endpoint">
        <div class="flex items-center justify-between mb-4">
            <div class="flex items-center space-x-3">
                <span class="http-method http-get">GET</span>
                <code class="text-sm font-mono">/api/v1/proposals/{id}</code>
            </div>
            <span class="text-xs text-content bg-background-darker px-2 py-1 rounded">No auth required</span>
        </div>
        <h3 class="text-lg font-semibold mb-2">Get Proposal Details</h3>
        <p class="text-content mb-4">
            Retrieve detailed information about a specific proposal including optional related data.
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
                <p class="text-sm text-content mb-2">The proposal ID.</p>
                <p class="text-xs text-content"><strong>Example:</strong> <code class="bg-background-darker px-1 rounded">123</code></p>
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
                <p class="text-xs text-content mb-2"><strong>Available includes:</strong> <code class="bg-background-darker px-1 rounded">campaign</code>, <code class="bg-background-darker px-1 rounded">user</code>, <code class="bg-background-darker px-1 rounded">fund</code>, <code class="bg-background-darker px-1 rounded">team</code>, <code class="bg-background-darker px-1 rounded">schedule</code>, <code class="bg-background-darker px-1 rounded">links</code>, <code class="bg-background-darker px-1 rounded">reviews</code></p>
                <p class="text-xs text-content"><strong>Example:</strong> <code class="bg-background-darker px-1 rounded">campaign,fund,team,reviews</code></p>
            </div>
        </div>

        <!-- Example Request -->
        <div class="mb-6">
            <h4 class="font-semibold text-content mb-3">Example Request</h4>
            <div class="bg-background-darker rounded-lg p-4 overflow-x-auto">
                <pre class="text-sm text-content"><code>GET /api/v1/proposals/123?include=campaign,fund,team</code></pre>
            </div>
        </div>

        <!-- Example Response -->
        <div class="mb-6">
            <h4 class="font-semibold text-content mb-3">Example Response</h4>
            <div class="bg-background-darker rounded-lg p-4 overflow-x-auto">
                <pre class="text-sm text-content"><code>{
  "data": {
    "id": 123,
    "title": {
      "en": "DeFi Protocol Development"
    },
    "status": "funded",
    "type": "project",
    "category": "developer-tools",
    "amount_requested": 50000000,
    "amount_received": 45000000,
    "funded_at": "2024-01-15T10:30:00Z",
    "yes_votes_count": 250,
    "no_votes_count": 15,
    "reviews_count": 12,
    "description": "A comprehensive DeFi protocol...",
    "created_at": "2023-12-01T09:00:00Z",
    "updated_at": "2024-01-15T10:30:00Z",
    "campaign": {
      "id": 456,
      "title": "Developer Tools",
      "budget": 500000000,
      "proposals_count": 45
    },
    "fund": {
      "id": 12,
      "title": "Fund 12",
      "status": "completed",
      "amount": 50000000000
    },
    "team": [
      {
        "id": 789,
        "name": "John Doe",
        "role": "Project Lead"
      }
    ]
  }
}</code></pre>
            </div>
        </div>
    </div>
</section>

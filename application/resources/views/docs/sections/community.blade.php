<!-- Community -->
<section id="community" class="mb-12">
    <h2 class="text-2xl font-bold text-content border-b border-border-secondary pb-4 mb-8">
        Community
    </h2>

    <div class="endpoint">
        <div class="flex items-center justify-between mb-4">
            <div class="flex items-center space-x-3">
                <span class="http-method http-get">GET</span>
                <code class="text-sm font-mono">/api/v1/communities</code>
            </div>
            <span class="text-xs text-content bg-background-darker px-2 py-1 rounded">No auth required</span>
        </div>
        <h3 class="text-lg font-semibold mb-2">List Communities</h3>
        <p class="text-content mb-4">
            Retrieve a paginated list of Project Catalyst communities and organizations.
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
                    <p class="text-sm text-content mb-2">Number of communities per page (maximum 60).</p>
                    <p class="text-xs text-content"><strong>Example:</strong> <code class="bg-background-darker px-1 rounded">20</code></p>
                </div>

                <div class="border border-border-secondary rounded p-3">
                    <div class="flex items-center justify-between mb-2">
                        <span class="font-mono text-sm bg-background-darker px-2 py-1 rounded">filter[name]</span>
                        <div class="flex items-center space-x-2">
                            <span class="text-xs px-2 py-1 rounded bg-green-100 text-green-800">string</span>
                            <span class="text-xs px-2 py-1 rounded bg-background-darker text-content">optional</span>
                        </div>
                    </div>
                    <p class="text-sm text-content mb-2">Search communities by name (case insensitive).</p>
                    <p class="text-xs text-content"><strong>Example:</strong> <code class="bg-background-darker px-1 rounded">Cardano</code></p>
                </div>

                <div class="border border-border-secondary rounded p-3">
                    <div class="flex items-center justify-between mb-2">
                        <span class="font-mono text-sm bg-background-darker px-2 py-1 rounded">filter[verified]</span>
                        <div class="flex items-center space-x-2">
                            <span class="text-xs px-2 py-1 rounded bg-orange-100 text-orange-800">boolean</span>
                            <span class="text-xs px-2 py-1 rounded bg-background-darker text-content">optional</span>
                        </div>
                    </div>
                    <p class="text-sm text-content mb-2">Filter by verified status.</p>
                    <p class="text-xs text-content"><strong>Example:</strong> <code class="bg-background-darker px-1 rounded">true</code></p>
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
                    <p class="text-xs text-content mb-2"><strong>Available includes:</strong> <code class="bg-background-darker px-1 rounded">users</code>, <code class="bg-background-darker px-1 rounded">proposals</code>, <code class="bg-background-darker px-1 rounded">links</code></p>
                    <p class="text-xs text-content"><strong>Example:</strong> <code class="bg-background-darker px-1 rounded">users,proposals</code></p>
                </div>

                <div class="border border-border-secondary rounded p-3">
                    <div class="flex items-center justify-between mb-2">
                        <span class="font-mono text-sm bg-background-darker px-2 py-1 rounded">sort</span>
                        <div class="flex items-center space-x-2">
                            <span class="text-xs px-2 py-1 rounded bg-green-100 text-green-800">string</span>
                            <span class="text-xs px-2 py-1 rounded bg-background-darker text-content">optional</span>
                        </div>
                    </div>
                    <p class="text-sm text-content mb-2">Sort by field. Prefix with - for descending order.</p>
                    <p class="text-xs text-content mb-2"><strong>Available fields:</strong> <code class="bg-background-darker px-1 rounded">name</code>, <code class="bg-background-darker px-1 rounded">members_count</code>, <code class="bg-background-darker px-1 rounded">proposals_count</code>, <code class="bg-background-darker px-1 rounded">created_at</code></p>
                    <p class="text-xs text-content"><strong>Example:</strong> <code class="bg-background-darker px-1 rounded">-members_count</code></p>
                </div>
            </div>
        </div>

        <!-- Example Request -->
        <div class="mb-6">
            <h4 class="font-semibold text-content mb-3">Example Request</h4>
            <div class="bg-background-darker rounded-lg p-4 overflow-x-auto">
                <pre class="text-sm text-content"><code>GET /api/v1/communities?filter%5Bverified%5D=true&include=users&sort=-members_count&per_page=10</code></pre>
            </div>
        </div>

        <!-- Example Response -->
        <div class="mb-6">
            <h4 class="font-semibold text-content mb-3">Example Response</h4>
            <div class="bg-background-darker rounded-lg p-4 overflow-x-auto">
                <pre class="text-sm text-content"><code>{
  "data": [
    {
      "id": 1,
      "name": "Cardano Community",
      "slug": "cardano-community",
      "verified": true,
      "description": "The official Cardano blockchain community",
      "website": "https://cardano.org",
      "members_count": 15420,
      "proposals_count": 89,
      "created_at": "2021-01-15T10:30:00Z",
      "updated_at": "2024-02-18T14:20:00Z",
      "users": [
        {
          "id": 123,
          "name": "John Doe",
          "role": "Administrator",
          "joined_at": "2021-02-01T09:00:00Z"
        }
      ]
    }
  ],
  "links": {
    "first": "https://www.catalystexplorer.com/api/v1/communities?page=1",
    "last": "https://www.catalystexplorer.com/api/v1/communities?page=5",
    "prev": null,
    "next": "https://www.catalystexplorer.com/api/v1/communities?page=2"
  },
  "meta": {
    "current_page": 1,
    "from": 1,
    "last_page": 5,
    "per_page": 10,
    "to": 10,
    "total": 43
  }
}</code></pre>
            </div>
        </div>
    </div>

    <div class="endpoint">
        <div class="flex items-center justify-between mb-4">
            <div class="flex items-center space-x-3">
                <span class="http-method http-get">GET</span>
                <code class="text-sm font-mono">/api/v1/communities/{id}</code>
            </div>
            <span class="text-xs text-content bg-background-darker px-2 py-1 rounded">No auth required</span>
        </div>
        <h3 class="text-lg font-semibold mb-2">Get Community Details</h3>
        <p class="text-content mb-4">
            Retrieve detailed information about a specific community including members and projects.
        </p>

        <!-- URL Parameters -->
        <div class="mb-6">
            <h4 class="font-semibold text-content mb-3">URL Parameters</h4>
            <div class="border border-border-secondary rounded p-3">
                <div class="flex items-center justify-between mb-2">
                    <span class="font-mono text-sm bg-background-darker px-2 py-1 rounded">id</span>
                    <div class="flex items-center space-x-2">
                        <span class="text-xs px-2 py-1 rounded bg-blue-100 text-blue-800">integer|string</span>
                        <span class="text-xs px-2 py-1 rounded bg-red-100 text-red-800">required</span>
                    </div>
                </div>
                <p class="text-sm text-content mb-2">The community ID or slug.</p>
                <p class="text-xs text-content"><strong>Example:</strong> <code class="bg-background-darker px-1 rounded">1</code> or <code class="bg-background-darker px-1 rounded">cardano-community</code></p>
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
                <p class="text-xs text-content mb-2"><strong>Available includes:</strong> <code class="bg-background-darker px-1 rounded">users</code>, <code class="bg-background-darker px-1 rounded">proposals</code>, <code class="bg-background-darker px-1 rounded">links</code>, <code class="bg-background-darker px-1 rounded">statistics</code></p>
                <p class="text-xs text-content"><strong>Example:</strong> <code class="bg-background-darker px-1 rounded">users,proposals,statistics</code></p>
            </div>
        </div>

        <!-- Example Request -->
        <div class="mb-6">
            <h4 class="font-semibold text-content mb-3">Example Request</h4>
            <div class="bg-background-darker rounded-lg p-4 overflow-x-auto">
                <pre class="text-sm text-content"><code>GET /api/v1/communities/cardano-community?include=users,proposals,statistics</code></pre>
            </div>
        </div>

        <!-- Example Response -->
        <div class="mb-6">
            <h4 class="font-semibold text-content mb-3">Example Response</h4>
            <div class="bg-background-darker rounded-lg p-4 overflow-x-auto">
                <pre class="text-sm text-content"><code>{
  "data": {
    "id": 1,
    "name": "Cardano Community",
    "slug": "cardano-community",
    "verified": true,
    "description": "The official Cardano blockchain community focusing on education, development, and ecosystem growth.",
    "website": "https://cardano.org",
    "twitter_handle": "@cardano",
    "discord_url": "https://discord.gg/cardano",
    "members_count": 15420,
    "proposals_count": 89,
    "total_funding_received": 25000000000,
    "created_at": "2021-01-15T10:30:00Z",
    "updated_at": "2024-02-18T14:20:00Z",
    "users": [
      {
        "id": 123,
        "name": "John Doe",
        "username": "johndoe",
        "role": "Administrator",
        "bio": "Blockchain developer and Cardano advocate",
        "joined_at": "2021-02-01T09:00:00Z"
      },
      {
        "id": 456,
        "name": "Jane Smith",
        "username": "janesmith",
        "role": "Member",
        "bio": "Community manager and event organizer",
        "joined_at": "2021-03-15T14:45:00Z"
      }
    ],
    "proposals": [
      {
        "id": 789,
        "title": {
          "en": "Community Education Platform"
        },
        "status": "funded",
        "amount_requested": 75000000,
        "amount_received": 75000000
      }
    ],
    "statistics": {
      "active_members": 8240,
      "funded_projects": 52,
      "success_rate": 0.58,
      "average_proposal_amount": 280898,
      "total_ada_distributed": 25000000000
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
                <code class="text-sm font-mono">/api/v1/communities/{id}/proposals</code>
            </div>
            <span class="text-xs text-content bg-background-darker px-2 py-1 rounded">No auth required</span>
        </div>
        <h3 class="text-lg font-semibold mb-2">Get Community Proposals</h3>
        <p class="text-content mb-4">
            Retrieve proposals associated with a specific community.
        </p>

        <!-- URL Parameters -->
        <div class="mb-6">
            <h4 class="font-semibold text-content mb-3">URL Parameters</h4>
            <div class="border border-border-secondary rounded p-3">
                <div class="flex items-center justify-between mb-2">
                    <span class="font-mono text-sm bg-background-darker px-2 py-1 rounded">id</span>
                    <div class="flex items-center space-x-2">
                        <span class="text-xs px-2 py-1 rounded bg-blue-100 text-blue-800">integer|string</span>
                        <span class="text-xs px-2 py-1 rounded bg-red-100 text-red-800">required</span>
                    </div>
                </div>
                <p class="text-sm text-content mb-2">The community ID or slug.</p>
                <p class="text-xs text-content"><strong>Example:</strong> <code class="bg-background-darker px-1 rounded">cardano-community</code></p>
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
                        <span class="font-mono text-sm bg-background-darker px-2 py-1 rounded">filter[status]</span>
                        <div class="flex items-center space-x-2">
                            <span class="text-xs px-2 py-1 rounded bg-green-100 text-green-800">string</span>
                            <span class="text-xs px-2 py-1 rounded bg-background-darker text-content">optional</span>
                        </div>
                    </div>
                    <p class="text-sm text-content mb-2">Filter proposals by status.</p>
                    <p class="text-xs text-content"><strong>Example:</strong> <code class="bg-background-darker px-1 rounded">funded</code></p>
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
                    <p class="text-xs text-content"><strong>Example:</strong> <code class="bg-background-darker px-1 rounded">campaign,fund</code></p>
                </div>
            </div>
        </div>

        <!-- Example Request -->
        <div class="mb-6">
            <h4 class="font-semibold text-content mb-3">Example Request</h4>
            <div class="bg-background-darker rounded-lg p-4 overflow-x-auto">
                <pre class="text-sm text-content"><code>GET /api/v1/communities/cardano-community/proposals?filter%5Bstatus%5D=complete&include=campaign</code></pre>
            </div>
        </div>

        <!-- Example Response -->
        <div class="mb-6">
            <h4 class="font-semibold text-content mb-3">Example Response</h4>
            <div class="bg-background-darker rounded-lg p-4 overflow-x-auto">
                <pre class="text-sm text-content"><code>{
  "data": [
    {
      "id": 789,
      "title": {
        "en": "Community Education Platform"
      },
      "status": "funded",
      "type": "project",
      "amount_requested": 75000000,
      "amount_received": 75000000,
      "funded_at": "2024-01-20T11:15:00Z",
      "campaign": {
        "id": 456,
        "title": "Community & Outreach",
        "budget": 5000000000
      }
    }
  ],
  "links": {
    "first": "https://www.catalystexplorer.com/api/v1/communities/cardano-community/proposals?page=1",
    "last": "https://www.catalystexplorer.com/api/v1/communities/cardano-community/proposals?page=8",
    "prev": null,
    "next": "https://www.catalystexplorer.com/api/v1/communities/cardano-community/proposals?page=2"
  },
  "meta": {
    "current_page": 1,
    "from": 1,
    "last_page": 8,
    "per_page": 15,
    "to": 15,
    "total": 115
  }
}</code></pre>
            </div>
        </div>
    </div>
</section>

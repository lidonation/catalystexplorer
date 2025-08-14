# API Platform Meilisearch Integration

## Overview

The Catalyst Explorer API Platform integration provides fuzzy search functionality for proposals using Meilisearch. This setup combines the power of API Platform's JSON-LD/OpenAPI capabilities with Meilisearch's advanced search features.

## Endpoints

### Base Endpoints
- **Collection**: `GET /api/v1/proposals`
- **Item**: `GET /api/v1/proposals/{id}`

### Search Parameters

#### Primary Search (Meilisearch)
- **Parameter**: `search`
- **Type**: string
- **Description**: Fuzzy search with typo tolerance and relevance ranking
- **Example**: `/api/v1/proposals?search=yoroi wallet`

#### Field-Specific Search (Fallback)
- **Parameters**: `title`, `slug`, `problem`, `solution`
- **Type**: string
- **Description**: Direct field search using ILIKE pattern matching
- **Example**: `/api/v1/proposals?title=blockchain`

## Search Features

### Meilisearch Capabilities
- **Typo Tolerance**: Handles 1-2 character typos automatically
- **Relevance Ranking**: Results sorted by relevance score
- **Fast Performance**: Sub-millisecond response times
- **Prefix Matching**: Matches terms starting with query
- **Phrase Search**: Exact phrases with quotes
- **Stop Words**: Common words filtered out

### Indexed Fields
The following fields are indexed in Meilisearch:
- `title`
- `problem`
- `solution`
- `content`
- `excerpt`
- `experience`
- `website`
- `definition_of_success`

## Usage Examples

### Basic Search
```bash
curl "http://localhost/api/v1/proposals?search=cardano"
```

### Multi-term Search
```bash
curl "http://localhost/api/v1/proposals?search=defi+protocol"
```

### Search with Pagination
```bash
curl "http://localhost/api/v1/proposals?search=blockchain&page=2"
```

### Search with Typos
```bash
curl "http://localhost/api/v1/proposals?search=blokchain"
# Returns results for "blockchain"
```

### Fallback Field Search
```bash
curl "http://localhost/api/v1/proposals?title=yoroi"
```

## Response Format

### Collection Response
```json
{
  "@context": "/api/v1/contexts/Proposal",
  "@id": "/api/v1/proposals",
  "@type": "Collection",
  "totalItems": 150,
  "member": [
    {
      "@id": "/api/v1/proposals/uuid-here",
      "@type": "Proposal",
      "title": "Yoroi Mobile Wallet",
      "slug": "yoroi-mobile-wallet",
      "problem": "Mobile users need better wallet access",
      "solution": "Build a mobile-first wallet application",
      // ... other proposal fields
    }
  ],
  "view": {
    "@id": "/api/v1/proposals?search=yoroi&page=1",
    "@type": "PartialCollectionView",
    "first": "/api/v1/proposals?search=yoroi&page=1",
    "last": "/api/v1/proposals?search=yoroi&page=5",
    "next": "/api/v1/proposals?search=yoroi&page=2"
  }
}
```

## Configuration

### Meilisearch Settings
The Proposal model includes:
- **Filterable Attributes**: id, funded, currency, etc.
- **Searchable Attributes**: title, problem, solution, content, etc.
- **Sortable Attributes**: title, amount_requested, created_at, etc.
- **Ranking Rules**: words, typo, proximity, attribute, sort, exactness

### Scout Configuration
Located in `config/scout.php`:
```php
'driver' => env('SCOUT_DRIVER', 'meilisearch'),
'meilisearch' => [
    'host' => env('MEILISEARCH_HOST', 'http://catalystexplorer-search:7700'),
    'key' => env('MEILISEARCH_KEY'),
],
```

## Architecture

### Components
1. **MeiliSearchFilter**: Custom API Platform filter (`app/ApiPlatform/Filter/MeiliSearchFilter.php`)
2. **Proposal Model**: Includes `Searchable` trait and API Platform attributes
3. **Laravel Scout**: Bridge between Eloquent and Meilisearch
4. **API Platform**: Handles JSON-LD serialization and OpenAPI docs

### Search Flow
1. Request with `search` parameter hits API Platform
2. MeiliSearchFilter intercepts the request
3. Laravel Scout performs Meilisearch query
4. Results paginated and returned as JSON-LD
5. Fallback to PartialSearchFilter if Meilisearch fails

## Setup Instructions

### 1. Ensure Meilisearch is Running
```bash
# Docker
docker run -it --rm -p 7700:7700 getmeili/meilisearch:latest

# Or use your existing container
```

### 2. Index Proposals
```bash
php artisan scout:import "App\Models\Proposal"
```

### 3. Test the API
```bash
# Start Laravel server
php artisan serve

# Test search endpoint
curl "http://localhost:8000/api/v1/proposals?search=blockchain"

# Or use the test script
php test-search-api.php
```

## Troubleshooting

### Common Issues

1. **Meilisearch not running**
   - Check `MEILISEARCH_HOST` in `.env`
   - Verify Meilisearch container/service is up

2. **Empty search results**
   - Run `php artisan scout:import "App\Models\Proposal"`
   - Check if proposals exist in database

3. **Memory errors**
   - Increase PHP memory limit
   - Check for circular dependencies in model relationships

4. **API not responding**
   - Check if API Platform routes are registered
   - Verify `php artisan route:list` shows `/api/v1/proposals`

### Debug Commands
```bash
# Check Scout configuration
php artisan scout:status

# Clear and rebuild index
php artisan scout:flush "App\Models\Proposal"
php artisan scout:import "App\Models\Proposal"

# Check API Platform routes
php artisan route:list | grep api/v1
```

## Performance Considerations

- **Indexing**: Proposals automatically sync to Meilisearch on create/update
- **Pagination**: Default 30 items per page, configurable
- **Caching**: Meilisearch handles caching internally
- **Failover**: Automatic fallback to database search if Meilisearch fails

## Security

- **Input Validation**: Search queries are sanitized
- **Rate Limiting**: Consider adding rate limiting to search endpoints
- **Authentication**: No authentication required for read operations
- **CORS**: Configure CORS headers as needed

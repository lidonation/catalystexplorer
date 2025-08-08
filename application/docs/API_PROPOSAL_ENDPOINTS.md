# Proposal API Endpoints

This document describes the API Platform endpoints for the Proposal resource.

## Endpoints

### Get Paginated Collection of Proposals
```
GET /api/v1/proposals
```

**Parameters:**
- `page` (optional, default: 1) - Page number
- `itemsPerPage` (optional, default: 60, max: 60) - Number of items per page

**Example Request:**
```bash
curl -H "Accept: application/ld+json" \
     "http://localhost/api/v1/proposals?page=1&itemsPerPage=10"
```

**Response Format:**
```json
{
  "@context": "/api/v1/contexts/Proposal",
  "@id": "/api/v1/proposals",
  "@type": "hydra:Collection",
  "hydra:member": [
    {
      "@id": "/api/v1/proposals/proposal-hash-123",
      "@type": "Proposal",
      "hash": "proposal-hash-123",
      "title": "Example Proposal Title",
      "slug": "example-proposal-title",
      "status": "active",
      ...
    }
  ],
  "hydra:totalItems": 1250,
  "hydra:view": {
    "@id": "/api/v1/proposals?page=1&itemsPerPage=10",
    "@type": "hydra:PartialCollectionView",
    "hydra:first": "/api/v1/proposals?page=1&itemsPerPage=10",
    "hydra:last": "/api/v1/proposals?page=125&itemsPerPage=10",
    "hydra:next": "/api/v1/proposals?page=2&itemsPerPage=10"
  }
}
```

### Get Single Proposal by Hash
```
GET /api/v1/proposals/{hash}
```

**Parameters:**
- `hash` (required) - The proposal hash identifier

**Example Request:**
```bash
curl -H "Accept: application/ld+json" \
     "http://localhost/api/v1/proposals/proposal-hash-123"
```

**Response Format:**
```json
{
  "@context": "/api/v1/contexts/Proposal",
  "@id": "/api/v1/proposals/proposal-hash-123",
  "@type": "Proposal",
  "hash": "proposal-hash-123",
  "title": "Example Proposal Title",
  "slug": "example-proposal-title",
  "status": "active",
  "campaign": {
    "title": "Campaign Title",
    "hash": "campaign-hash-456"
  },
  "fund": {
    "title": "Fund Title", 
    "hash": "fund-hash-789"
  },
  "users": [...],
  "reviews": [...],
  ...
}
```

## Key Features

1. **Hidden Fields**: The `iog_hash` field is hidden from API responses
2. **Pagination**: Collections are automatically paginated (max 60 items per page)
3. **Campaign Data**: Campaign relationship is eagerly loaded for API Platform requests only
4. **Hash-based Lookups**: Single items are retrieved using hash identifiers instead of database IDs
5. **Computed Attributes**: Access to all model attributes, relationships, and computed properties
6. **API-Specific Loading**: Relationships are only eager loaded for API Platform requests, not affecting other parts of the application

## Content Types

The API supports these content types:
- `application/ld+json` (JSON-LD with Hydra)
- `application/json` (Plain JSON)

## Error Responses

### 404 Not Found
When requesting a proposal that doesn't exist:
```json
{
  "@context": "/api/v1/contexts/Error",
  "@type": "hydra:Error", 
  "hydra:title": "An error occurred",
  "hydra:description": "Not Found"
}
```

## Testing the Setup

Run the test command to verify the setup:
```bash
php artisan test:api-platform
```

## API Documentation

Visit `/api/v1/docs` in your browser to see the automatically generated API documentation (Swagger UI).

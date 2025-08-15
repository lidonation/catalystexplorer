# Proposal REST API Documentation

## Overview
The Proposal API uses Laravel API Resources with Spatie Query Builder to provide powerful filtering, sorting, and relationship includes.

## API Versioning
The API is versioned using URL prefixes. The current version is `v1`.

### Versioning Strategy
- **v1 (Current):** Full-featured REST API with Spatie Query Builder
- **Legacy (Unversioned):** Basic endpoints maintained for backward compatibility
- **Future versions (v2, v3, etc.):** Will be added as needed without breaking existing versions

### Migration Recommendations
- **New integrations:** Use the versioned API (`/api/v1/proposals`)
- **Existing integrations:** Legacy endpoints (`/api/proposals`) will continue to work
- **Best practice:** Gradually migrate to versioned endpoints for future-proofing

## Base URLs
**Versioned API (Recommended):**
```
/api/v1/proposals
```

**Legacy API (Unversioned - for backward compatibility):**
```
/api/proposals
```

## Endpoints

### 1. List Proposals
**GET** `/api/v1/proposals`

Returns a paginated list of proposals with optional filtering, sorting, and includes.

> **Legacy:** `GET /api/proposals` (unversioned endpoint still available for backward compatibility)

#### Query Parameters

##### Filtering
- `filter[id]=123` - Exact match by ID
- `filter[title]=search term` - Partial match by title
- `filter[status]=active` - Exact match by status
- `filter[type]=proposal` - Exact match by type
- `filter[category]=development` - Exact match by category
- `filter[campaign_id]=456` - Exact match by campaign ID
- `filter[fund_id]=789` - Exact match by fund ID
- `filter[funded]=1` - Filter only funded proposals
- `filter[amount_min]=1000` - Minimum amount requested
- `filter[amount_max]=50000` - Maximum amount requested

##### Sorting
- `sort=title` - Sort by title (ascending)
- `sort=-created_at` - Sort by created date (descending)
- `sort=amount_requested` - Sort by amount requested
- `sort=-yes_votes_count` - Sort by votes (descending)

Available sort fields:
- `title`
- `status`
- `amount_requested`
- `amount_received`
- `yes_votes_count`
- `no_votes_count`
- `funded_at`
- `created_at`
- `updated_at`

##### Includes (Relationships)
- `include=campaign` - Include campaign relationship
- `include=user` - Include user relationship
- `include=fund` - Include fund relationship
- `include=campaign,user` - Include multiple relationships

##### Pagination
- `per_page=24` - Items per page (max 60)
- `page=2` - Page number

### 2. Get Single Proposal
**GET** `/api/v1/proposals/{id}`

Returns a single proposal by ID.

> **Legacy:** Individual proposal endpoints are only available in the versioned API.

#### Query Parameters
- `include=campaign,user` - Include relationships

## Example Requests

### Basic List
```
GET /api/v1/proposals
```

### List with Campaign Relationship
```
GET /api/v1/proposals?include=campaign
```

### Filtered and Sorted List
```
GET /api/v1/proposals?filter[status]=active&filter[campaign_id]=123&sort=-amount_requested&include=campaign
```

### Complex Query
```
GET /api/v1/proposals?include=campaign,user&filter[funded]=1&filter[amount_min]=1000&sort=-funded_at&per_page=50
```

### Get Single Proposal with Relationships
```
GET /api/v1/proposals/12345?include=campaign,user,fund
```

### Legacy Examples (Unversioned)
```
GET /api/proposals                    # Basic list only
GET /api/proposals?include=campaign   # Legacy endpoint with basic filtering
```

## Response Format

### List Response
```json
{
  "data": [
    {
      "id": "12345",
      "title": "Sample Proposal",
      "slug": "sample-proposal",
      "status": "active",
      "amount_requested": 25000,
      "currency": "ADA",
      "campaign": {
        "id": "456",
        "title": "Sample Campaign",
        "status": "active"
      },
      "created_at": "2024-01-15T10:30:00Z",
      ...
    }
  ],
  "links": {
    "first": "/api/v1/proposals?page=1",
    "last": "/api/v1/proposals?page=10",
    "prev": null,
    "next": "/api/v1/proposals?page=2"
  },
  "meta": {
    "current_page": 1,
    "per_page": 24,
    "total": 240
  }
}
```

### Single Item Response
```json
{
  "data": {
    "id": "12345",
    "title": "Sample Proposal",
    "slug": "sample-proposal",
    "type": "proposal",
    "category": "development",
    "status": "active",
    "yes_votes_count": 150,
    "no_votes_count": 25,
    "amount_requested": 25000,
    "amount_received": 25000,
    "currency": "ADA",
    "problem": "Description of the problem...",
    "solution": "Description of the solution...",
    "experience": "Team experience...",
    "website": "https://example.com",
    "quickpitch": "https://youtube.com/watch?v=...",
    "excerpt": "Brief description...",
    "opensourced": true,
    "opensource_proposal": true,
    "funded_at": "2024-02-01T09:00:00Z",
    "created_at": "2024-01-15T10:30:00Z",
    "updated_at": "2024-02-01T09:00:00Z",
    "campaign": {
      "id": "456",
      "title": "Sample Campaign",
      "slug": "sample-campaign",
      "status": "active",
      "currency": "ADA",
      "launched_at": "2024-01-01T00:00:00Z"
    },
    "user": {
      "id": "789",
      "name": "John Doe"
    },
    "link": "https://yoursite.com/en/proposals/sample-proposal"
  }
}
```

## Available Fields

All proposal fields are included in the response:
- `id` - Unique identifier
- `title` - Proposal title
- `slug` - URL-friendly title
- `type` - Proposal type
- `category` - Proposal category
- `status` - Current status
- `yes_votes_count` - Number of yes votes
- `no_votes_count` - Number of no votes
- `amount_requested` - Requested funding amount
- `amount_received` - Actual received amount
- `currency` - Currency type
- `problem` - Problem description
- `solution` - Solution description
- `experience` - Team experience
- `website` - Project website
- `quickpitch` - Quick pitch video URL
- `excerpt` - Brief description
- `opensourced` - Is open source
- `opensource_proposal` - Open source proposal flag
- `funded_at` - Funding date
- `created_at` - Creation date
- `updated_at` - Last update date
- `campaign` - Related campaign (when included)
- `user` - Proposal owner (when included)
- `fund` - Related fund (when included)
- `link` - Full URL to proposal page

## Error Responses

### 404 Not Found
```json
{
  "message": "No query results for model [App\\Models\\Proposal] {id}"
}
```

### 422 Validation Error (invalid filters/sorts)
```json
{
  "message": "Requested filter(s) `invalid_field` are not allowed.",
  "errors": {
    "invalid_field": ["Invalid filter field"]
  }
}
```

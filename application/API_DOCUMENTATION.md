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
- `include=fund` - Include fund relationship
- `include=team` - Include team member relationships
- `include=meta_data` - Include proposal metadata
- `include=campaign,team` - Include multiple relationships

##### Pagination
- `per_page=24` - Items per page (max 60)
- `page=2` - Page number

### 2. Get Single Proposal
**GET** `/api/v1/proposals/{id}`

Returns a single proposal by ID.

> **Legacy:** Individual proposal endpoints are only available in the versioned API.

#### Query Parameters
- `include=campaign,meta_data` - Include relationships

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
GET /api/v1/proposals?include=campaign,team&filter[funded]=1&filter[amount_min]=1000&sort=-funded_at&per_page=50
```

### Get Single Proposal with Relationships
```
GET /api/v1/proposals/12345?include=campaign,team,fund,meta_data
```

### Legacy Examples (Unversioned)
```
GET /api/proposals                    # Basic list only
GET /api/proposals?include=campaign   # Legacy endpoint with basic filtering
```

---

## CatalystTally API

### Overview
The CatalystTally API provides access to proposal voting tallies and rankings from Catalyst Fund voting rounds. It supports conditional relationship loading for optimal performance.

### Endpoints

#### 1. List CatalystTallies
**GET** `/api/v1/catalyst-tallies`

Returns a paginated list of catalyst tallies with optional filtering and sorting.

##### Query Parameters

###### Filtering
- `fund=<uuid>` - Filter by fund UUID (e.g., `4890007c-d31c-4561-870f-14388d6b6d2c`)
- `search=<term>` - Search within proposal titles, problems, solutions, and fund titles
- `proposal_profiles=<id1,id2>` - Filter by proposal profile IDs (comma-separated)

###### Sorting
- `sort_by=tally` - Sort by tally count (default)
- `sort_by=fund_rank` - Sort by fund ranking
- `sort_by=category_rank` - Sort by category ranking
- `sort_by=overall_rank` - Sort by overall ranking
- `sort_by=chance_approval` - Sort by approval chance percentage
- `sort_by=chance_funding` - Sort by funding chance percentage
- `sort_direction=desc` - Sort direction: `asc` or `desc` (default: `desc`)

###### Relationship Includes 
- `include_fund=true` - Include fund relationship in response
- `include_proposal=true` - Include proposal relationship in response
- `include_proposal_profiles=true` - Include proposal profiles in response

> **Note:** Relationships are only loaded when explicitly requested or when needed for filtering, optimizing performance.

###### Pagination
- `per_page=20` - Items per page (max 100, default 20)
- `page=1` - Page number

#### 2. Get Single CatalystTally
**GET** `/api/v1/catalyst-tallies/{id}`

Returns a single catalyst tally by ID with all relationships loaded.

#### 3. Get Available Funds
**GET** `/api/v1/catalyst-tallies-funds`

Returns a list of funds that have catalyst tallies available for filtering.

#### 4. Get Statistics
**GET** `/api/v1/catalyst-tallies-stats`

Returns summary statistics about catalyst tallies.

### Example Requests

#### Basic List (Performance Optimized)
```
GET /api/v1/catalyst-tallies
```
Returns tallies without relationships for optimal performance.

#### Filter by Fund (Relationships Not Included)
```
GET /api/v1/catalyst-tallies?fund=4890007c-d31c-4561-870f-14388d6b6d2c
```
Filters by Fund 10 but doesn't include fund details in response.

#### Filter by Fund with Fund Details
```
GET /api/v1/catalyst-tallies?fund=4890007c-d31c-4561-870f-14388d6b6d2c&include_fund=true
```
Filters by Fund 10 and includes fund details in response.

#### Search with Proposal Details
```
GET /api/v1/catalyst-tallies?search=blockchain&include_proposal=true&sort_by=tally&sort_direction=desc
```
Searches for "blockchain" and includes proposal details, sorted by tally.

#### Complex Query with All Relationships
```
GET /api/v1/catalyst-tallies?fund=72c34fba-3665-4dfa-b6b1-ff72c916dc9c&include_fund=true&include_proposal=true&sort_by=fund_rank&per_page=50
```
Filters by Fund 11, includes all relationships, sorted by fund rank.

#### Get Available Funds
```
GET /api/v1/catalyst-tallies-funds
```
Returns list of funds with their UUIDs for filtering.

#### Get Statistics
```
GET /api/v1/catalyst-tallies-stats
```
Returns summary statistics.

### Response Formats

#### CatalystTally List Response
```json
{
  "data": [
    {
      "id": "a961290f-ce40-4d96-a885-e2a8b8875936",
      "hash": "proposal_1",
      "tally": 2345,
      "model_id": "9c8a5f2d-1b3e-4d7a-8f2c-5e9d8a1b3c4f",
      "category_rank": null,
      "fund_rank": 15,
      "overall_rank": null,
      "chance_approval": "85.50",
      "chance_funding": "72.30",
      "chance": "85.50",
      "created_at": "2023-09-26 15:38:15",
      "updated_at": "2023-09-26T15:38:15.000000Z"
    }
  ],
  "meta": {
    "total": 6520,
    "count": 20,
    "per_page": 20,
    "current_page": 1,
    "total_pages": 326,
    "has_more_pages": true
  },
  "links": {
    "first": "/api/v1/catalyst-tallies?page=1",
    "last": "/api/v1/catalyst-tallies?page=326",
    "prev": null,
    "next": "/api/v1/catalyst-tallies?page=2"
  },
  "filters": {
    "fund": null,
    "search": null,
    "proposal_profiles": null
  }
}
```

#### CatalystTally with Relationships Response
```json
{
  "data": [
    {
      "id": "a961290f-ce40-4d96-a885-e2a8b8875936",
      "hash": "proposal_1",
      "tally": 2345,
      "model_id": "9c8a5f2d-1b3e-4d7a-8f2c-5e9d8a1b3c4f",
      "category_rank": null,
      "fund_rank": 15,
      "overall_rank": null,
      "chance_approval": "85.50",
      "chance_funding": "72.30",
      "chance": "85.50",
      "fund": {
        "id": "4890007c-d31c-4561-870f-14388d6b6d2c",
        "title": "Fund 10",
        "slug": "fund-10",
        "label": "Fund 10",
        "status": "active",
        "currency": "ADA",
        "currency_symbol": "₳",
        "amount": 50000000,
        "launched_at": "2023-08-31T11:00:00.000000Z"
      },
      "proposal": {
        "id": "9c8a5f2d-1b3e-4d7a-8f2c-5e9d8a1b3c4f",
        "title": "Blockchain Education Platform",
        "slug": "blockchain-education-platform",
        "status": "active",
        "amount_requested": 25000,
        "currency": "ADA",
        "problem": "Lack of accessible blockchain education...",
        "solution": "Create a comprehensive learning platform..."
      },
      "created_at": "2023-09-26 15:38:15",
      "updated_at": "2023-09-26T15:38:15.000000Z"
    }
  ],
  "meta": { ... }
}
```

#### Available Funds Response
```json
{
  "data": [
    {
      "id": "4890007c-d31c-4561-870f-14388d6b6d2c",
      "title": "Fund 10",
      "slug": "fund-10"
    },
    {
      "id": "72c34fba-3665-4dfa-b6b1-ff72c916dc9c",
      "title": "Fund 11",
      "slug": "fund-11"
    },
    {
      "id": "e4e8ea34-867e-4f19-aea6-55d83ecb4ecd",
      "title": "Fund 12",
      "slug": "fund-12"
    }
  ]
}
```

#### Statistics Response
```json
{
  "data": {
    "total_tallies": 6520,
    "total_proposals": 6486,
    "total_funds": 5,
    "avg_tally": "222.87",
    "max_tally": 6789,
    "min_tally": 39
  }
}
```

#### Available Fields

CatalystTally fields:
- `id` - Unique identifier
- `hash` - Proposal hash identifier
- `tally` - Vote tally count
- `model_id` - Related proposal ID
- `category_rank` - Ranking within category
- `fund_rank` - Ranking within fund
- `overall_rank` - Overall ranking
- `chance_approval` - Approval chance percentage (0-100)
- `chance_funding` - Funding chance percentage (0-100)
- `chance` - Alias for chance_approval (backward compatibility)
- `created_at` - Creation timestamp
- `updated_at` - Last update timestamp
- `fund` - Related fund (when `include_fund=true`)
- `proposal` - Related proposal (when `include_proposal=true`)
- `proposal_profiles` - Related proposal profiles (when `include_proposal=true`)

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
    "team": [
      {
        "id": "team-001",
        "ideascale_id": "67890",
        "catalyst_id": null,
        "username": "project_lead",
        "name": "Jane Doe",
        "bio": "Blockchain architect with 8 years experience",
        "title": "Technical Lead",
        "proposals_count": 5,
        "hero_img_url": "https://example.com/jane.jpg"
      }
    ],
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
- `fund` - Related fund (when included)
- `team` - Team member profiles (when included)
- `meta_data` - Proposal metadata (when included)
- `link` - Full URL to proposal page

## Team Relation

The `team` relationship provides access to the team members associated with a proposal. This includes project leads, developers, advisors, and other contributors.

### Including Team Data
```
GET /api/v1/proposals?include=team
GET /api/v1/proposals/{id}?include=team
```

### Team Structure
The `team` field returns an array of team member objects with unified formatting for both IdeascaleProfile and CatalystProfile types.

#### Team Member Fields
- `id` - Unique identifier of the profile
- `ideascale_id` - Ideascale platform ID (when applicable)
- `catalyst_id` - Catalyst platform ID (when applicable)
- `username` - Platform username
- `name` - Full name of the team member
- `bio` - Biography or description
- `title` - Professional title or role
- `proposals_count` - Number of proposals associated with this profile
- `hero_img_url` - Profile image URL

### Example Response with Team Data
```json
{
  "data": {
    "id": "12345",
    "title": "Blockchain Education Platform",
    "slug": "blockchain-education-platform",
    "status": "active",
    "amount_requested": 25000,
    "currency": "ADA",
    "team": [
      {
        "id": "profile-001",
        "ideascale_id": "12345",
        "catalyst_id": null,
        "username": "john_dev",
        "name": "John Smith",
        "bio": "Experienced blockchain developer with 5+ years in Web3",
        "title": "Lead Developer",
        "proposals_count": 3,
        "hero_img_url": "https://example.com/profile/john.jpg"
      },
      {
        "id": "profile-002",
        "ideascale_id": null,
        "catalyst_id": "cat-456",
        "username": "sarah_pm",
        "name": "Sarah Johnson",
        "bio": "Product manager specializing in educational technology",
        "title": "Project Manager",
        "proposals_count": 1,
        "hero_img_url": "https://example.com/profile/sarah.jpg"
      }
    ],
    "created_at": "2024-01-15T10:30:00Z",
    "updated_at": "2024-02-01T09:00:00Z"
  }
}
```

### Simple Team Example
Some proposals may have minimal team data:
```json
{
  "data": {
    "id": "67890",
    "title": "Community Hub Development",
    "team": [
      {
        "id": "profile-003",
        "ideascale_id": "78901",
        "catalyst_id": null,
        "username": "community_lead",
        "name": "Alex Chen",
        "bio": null,
        "title": null,
        "proposals_count": 2,
        "hero_img_url": null
      }
    ]
  }
}
```

### Important Notes
- Team data structure is **consistent** across different profile types (Ideascale and Catalyst)
- Fields may be **null** when not available in the source profile
- **Mixed profile types** - A single proposal can have team members from both Ideascale and Catalyst platforms
- Team data is only included when explicitly requested via `include=team`
- Empty teams return an empty array `[]`
- The `proposals_count` field indicates how many proposals this team member is associated with across the platform

## Meta Data Relation

The `meta_data` relationship provides access to dynamic key-value metadata associated with proposals. This data is stored as schemaless information and can vary significantly between proposals.

### Including Meta Data
```
GET /api/v1/proposals?include=meta_data
GET /api/v1/proposals/{id}?include=meta_data
```

### Meta Data Structure
The `meta_data` field returns a flat object with string keys and values. The structure varies by proposal, but common fields include:

#### Common Meta Data Fields
- `funds_remaining` - Remaining project funding amount
- `unique_wallets` - Number of unique wallets that voted
- `alignment_score` - Community advisor alignment rating (0-5 scale)
- `auditability_score` - Community advisor auditability rating (0-5 scale) 
- `feasibility_score` - Community advisor feasibility rating (0-5 scale)
- `proposal_impact_score` - Impact assessment score
- `applicant_type` - Type of applicant ("Individual", "Entity (Not Incorporated)", etc.)
- `project_length` - Project duration in months
- `opensource` - Open source status ("1" for yes, "0" for no)

#### Catalyst Platform Integration
- `catalyst_document_id` - Document identifier in Catalyst system
- `catalyst_document_version` - Document version identifier
- `projectcatalyst_io_url` - Link to proposal on projectcatalyst.io
- `ideascale_id` - Legacy Ideascale platform identifier
- `iog_hash` - IOG internal hash identifier

#### Blockchain Integration
- `chain_proposal_id` - Proposal identifier on Cardano blockchain
- `chain_proposal_index` - Proposal index number on chain
- `proposal_public_key` - Cryptographic public key for proposal

#### Media and Resources
- `youtube` - Link to proposal presentation video
- `quickpitch` - Quick pitch video URL (may also be in main proposal fields)

### Example Response with Meta Data
```json
{
  "data": {
    "id": "12345",
    "title": "LATAM Cardano Community Operations",
    "slug": "latam-cardano-community-operations",
    "status": "active",
    "amount_requested": 75000,
    "currency": "ADA",
    "meta_data": {
      "alignment_score": "4.41",
      "applicant_type": "Entity (Not Incorporated)",
      "auditability_score": "3.55",
      "catalyst_document_id": "0198ae90-30b7-7a74-8a3b-e3c4cfc864be",
      "catalyst_document_version": "0198aed0-6d11-775a-9aab-3ffdb7a158cb",
      "chain_proposal_id": "78536759894080d15118cea4bb7dcf3c8c0e8654e6ffc78e8ead1c6e96f9920b",
      "chain_proposal_index": "106",
      "feasibility_score": "4.21",
      "funds_remaining": "1286190",
      "ideascale_id": "404699",
      "iog_hash": "800227",
      "opensource": "1",
      "projectcatalyst_io_url": "https://projectcatalyst.io/funds/14/cardano-open-ecosystem/latam-cardano-community-operations",
      "project_length": "6",
      "proposal_impact_score": "0",
      "proposal_public_key": "2jaUgcRgeZ9LisG7V/9AjdzYcZ32EvkrAYqaJcmhg+U=",
      "unique_wallets": "146",
      "youtube": "https://www.youtube.com/watch?v=j-zejRhSO3M&t=5256s"
    },
    "created_at": "2024-01-15T10:30:00Z",
    "updated_at": "2024-02-01T09:00:00Z"
  }
}
```

### Simple Meta Data Example
Some proposals may have minimal meta data:
```json
{
  "data": {
    "id": "67890",
    "title": "Cardano India Developers Community Hub",
    "meta_data": {
      "funds_remaining": "1286190",
      "unique_wallets": "178"
    }
  }
}
```

### Important Notes
- Meta data structure is **not guaranteed** - fields may be present or absent
- All values are stored as **strings**, including numeric data
- Field names use **snake_case** convention
- Some fields may contain URLs, identifiers, or encoded data
- Meta data is only included when explicitly requested via `include=meta_data`
- Empty meta data returns `null` or an empty object `{}`

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

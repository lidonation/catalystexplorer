# CatalystExplorer CLI Commands

This document provides comprehensive documentation for all custom Artisan commands available in CatalystExplorer.

## Table of Contents

- [Data Synchronization Commands](#data-synchronization-commands)
  - [sync:reviews](#syncreviews)
  - [sync:milestones](#syncmilestones)
  - [proposals:sync-from-catalyst](#proposalssync-from-catalyst)
  - [voting:sync-from-catalyst](#votingsync-from-catalyst)
  - [cx:sync-cardano-budget-proposals](#cxsync-cardano-budget-proposals)
- [Search Index Management](#search-index-management)
  - [search:index](#searchindex)
  - [cx:create-search-index](#cxcreate-search-index)
- [Data Processing Commands](#data-processing-commands)
  - [catalyst:process-historical-funds](#catalystprocess-historical-funds)
  - [ln:generate-connections](#lngenerate-connections)
  - [cx:import-catalyst-tally](#cximport-catalyst-tally)
- [Maintenance Commands](#maintenance-commands)
  - [cx:check-links](#cxcheck-links)
  - [proposals:find-duplicates](#proposalsfind-duplicates)
- [Utility Commands](#utility-commands)
  - [job:dispatch](#jobdispatch)

---

## Data Synchronization Commands

### sync:reviews

Sync proposal reviews from the Catalyst Reviews API (reviews.projectcatalyst.io).

**Signature:**
```bash
php artisan sync:reviews {fund_id} [options]
```

**Arguments:**
| Argument | Description | Required |
|----------|-------------|----------|
| `fund_id` | The fund UUID to associate reviews with | Yes |

**Options:**
| Option | Description | Default |
|--------|-------------|---------|
| `--sync` | Run synchronously instead of dispatching to queue | false |
| `--limit=N` | Limit the number of reviews to process | null (all) |
| `--page-size=N` | Number of reviews per API page | 50 |
| `--start-page=N` | Starting page number for pagination | 0 |

**Examples:**
```bash
# Sync all reviews for a fund (async mode - uses queue)
php artisan sync:reviews 019a9c61-7d7a-7277-b082-bd4137a5a936

# Sync reviews synchronously (for debugging)
php artisan sync:reviews 019a9c61-7d7a-7277-b082-bd4137a5a936 --sync

# Sync only the first 100 reviews
php artisan sync:reviews 019a9c61-7d7a-7277-b082-bd4137a5a936 --sync --limit=100

# Sync with custom page size starting from page 5
php artisan sync:reviews 019a9c61-7d7a-7277-b082-bd4137a5a936 --sync --page-size=100 --start-page=5
```

**What it does:**
- Paginates through the Catalyst Reviews API
- Creates/updates Reviewer records (matched by `catalyst_reviewer_id`)
- Creates Discussion records for proposals (Impact, Feasibility, Value for Money)
- Creates Review records with content from the API
- Creates Rating records linked to reviews and discussions

---

### sync:milestones

Sync Catalyst milestones and project schedules from the Catalyst Milestone Module API.

**Signature:**
```bash
php artisan sync:milestones [options]
```

**Options:**
| Option | Description | Default |
|--------|-------------|---------|
| `--sync` | Run synchronously instead of dispatching to queue | false |
| `--limit=N` | Limit the number of project schedules to process | null (all) |

**Examples:**
```bash
# Sync all milestones (async mode)
php artisan sync:milestones

# Sync milestones synchronously
php artisan sync:milestones --sync

# Sync only first 50 project schedules
php artisan sync:milestones --sync --limit=50
```

**What it does:**
- Fetches all project schedules from the Catalyst Milestone Module
- Syncs milestone data for each project
- Updates project status and progress information

---

### proposals:sync-from-catalyst

Sync proposal details from the Catalyst API Gateway.

**Signature:**
```bash
php artisan proposals:sync-from-catalyst [options]
```

**Options:**
| Option | Description | Default |
|--------|-------------|---------|
| `--document-id=ID` | Specific Catalyst document ID to sync | null |
| `--fund=FUND` | Fund identifier (e.g., fund15) | fund15 |
| `--proposal-id=UUID` | Specific proposal UUID to sync | null |
| `--batch-size=N` | Number of documents to process per batch | 10 |
| `--limit=N` | Maximum number of documents to process | null |

**Examples:**
```bash
# Sync a specific proposal by its UUID
php artisan proposals:sync-from-catalyst --proposal-id=12345678-1234-1234-1234-123456789abc

# Sync a specific document from the Catalyst Gateway
php artisan proposals:sync-from-catalyst --document-id=abc123 --fund=fund15

# Sync a proposal with a specific document ID override
php artisan proposals:sync-from-catalyst --proposal-id=12345678-1234-1234-1234-123456789abc --document-id=def456

# Batch sync with custom settings
php artisan proposals:sync-from-catalyst --fund=fund14 --batch-size=20 --limit=100
```

**What it does:**
- Fetches proposal details from the Catalyst Gateway API
- Updates proposal content, metadata, and related information
- Can sync individual proposals or batch process multiple documents

---

### voting:sync-from-catalyst

Sync voting results from the Project Catalyst API.

**Signature:**
```bash
php artisan voting:sync-from-catalyst [options]
```

**Options:**
| Option | Description | Default |
|--------|-------------|---------|
| `--fund=UUID` | Fund UUID to sync voting results for | **Required** |
| `--challenge=SLUG` | Specific challenge slug to sync | null (all) |
| `--sync` | Run synchronously instead of queueing jobs | false |
| `--update-details` | Also update campaign ID and amount received | false |

**Examples:**
```bash
# Sync all voting results for Fund 14
php artisan voting:sync-from-catalyst --fund=019a9c61-7d7a-7277-b082-bd4137a5a936

# Sync specific challenge
php artisan voting:sync-from-catalyst --fund=019a9c61-7d7a-7277-b082-bd4137a5a936 --challenge=cardano-open-developers

# Sync synchronously with full updates
php artisan voting:sync-from-catalyst --fund=019a9c61-7d7a-7277-b082-bd4137a5a936 --sync --update-details
```

**Supported Funds:**
- Fund 10, 11, 12, 13, 14 (with pre-configured challenge mappings)

**What it does:**
- Fetches voting data from Project Catalyst GraphQL API
- Updates proposal voting statistics (yes/no/abstain votes)
- Optionally updates campaign associations and funding amounts

---

### cx:sync-cardano-budget-proposals

Sync Cardano budget proposals from the GovTool API.

**Signature:**
```bash
php artisan cx:sync-cardano-budget-proposals
```

**Examples:**
```bash
# Sync all active budget proposals
php artisan cx:sync-cardano-budget-proposals
```

**What it does:**
- Fetches active budget proposals from GovTool API
- Creates/updates CardanoBudgetProposal records
- Syncs proposal details, costs, ownership information

---

## Search Index Management

### search:index

Unified command for managing Meilisearch indexes.

**Signature:**
```bash
php artisan search:index {action} {filter?}
```

**Arguments:**
| Argument | Description | Required |
|----------|-------------|----------|
| `action` | Action to perform: `create`, `import`, `flush`, `delete`, `seed`, `recreate` | Yes |
| `filter` | Optional filter for model or index name | No |

**Examples:**
```bash
# Create all search indexes
php artisan search:index create

# Create index for proposals only
php artisan search:index create proposal

# Import all data to indexes
php artisan search:index import

# Import only community data
php artisan search:index import community

# Flush (clear) all indexes
php artisan search:index flush

# Flush specific model index
php artisan search:index flush voter

# Delete all indexes
php artisan search:index delete

# Delete specific index
php artisan search:index delete cx_proposals

# Seed indexes from seeder
php artisan search:index seed

# Recreate all indexes (delete + seed)
php artisan search:index recreate
```

**Indexed Models:**
- `Voter`, `BookmarkCollection`, `ProjectSchedule`, `Community`
- `Proposal`, `IdeascaleProfile`, `Group`, `Review`
- `MonthlyReport`, `Transaction`, `VoterHistory`

---

### cx:create-search-index

Create a search index for a specific model with all configurations.

**Signature:**
```bash
php artisan cx:create-search-index {model} {name?} [options]
```

**Arguments:**
| Argument | Description | Required |
|----------|-------------|----------|
| `model` | Fully qualified model class name | Yes |
| `name` | Custom index name | No |

**Options:**
| Option | Description |
|--------|-------------|
| `-k, --key=KEY` | Name of the primary key |

**Examples:**
```bash
# Create index for Proposal model
php artisan cx:create-search-index "App\Models\Proposal"

# Create index with custom primary key
php artisan cx:create-search-index "App\Models\Review" --key=uuid

# Create index for Community model
php artisan cx:create-search-index "App\Models\Community"
```

**What it does:**
- Creates Meilisearch index for the specified model
- Configures filterable, sortable, and searchable attributes
- Sets up ranking rules and pagination limits
- Creates indexes for multiple locales (en, es, fr, sw)

---

## Data Processing Commands

### catalyst:process-historical-funds

Process historical funds to generate category ranks and approval chances.

**Signature:**
```bash
php artisan catalyst:process-historical-funds [options]
```

**Options:**
| Option | Description | Default |
|--------|-------------|---------|
| `--fund=UUID` | Specific fund UUID to process | null |
| `--all` | Process all funds | false |
| `--dry-run` | Show what would be processed without running | false |

**Examples:**
```bash
# Process a specific fund
php artisan catalyst:process-historical-funds --fund=019a9c61-7d7a-7277-b082-bd4137a5a936

# Process all funds (with confirmation prompt)
php artisan catalyst:process-historical-funds --all

# Dry run to see what would be processed
php artisan catalyst:process-historical-funds --all --dry-run
```

**What it does:**
- Dispatches UpdateTallyRank jobs for funds
- Calculates category rankings for proposals
- Computes approval chances based on historical data

---

### ln:generate-connections

Generate entries for the connections table linking proposals, users, and groups.

**Signature:**
```bash
php artisan ln:generate-connections [options]
```

**Options:**
| Option | Description | Default |
|--------|-------------|---------|
| `--clear` | Clear all connections first | false |

**Examples:**
```bash
# Generate connections (append to existing)
php artisan ln:generate-connections

# Clear existing connections and regenerate
php artisan ln:generate-connections --clear
```

**What it does:**
- Creates connection records between proposals, users, and groups
- Enables relationship traversal and network analysis
- Dispatches PopulateConnections jobs for each proposal

---

### cx:import-catalyst-tally

Import Catalyst vote cast snapshots from a JSON file.

**Signature:**
```bash
php artisan cx:import-catalyst-tally {file}
```

**Arguments:**
| Argument | Description | Required |
|----------|-------------|----------|
| `file` | Path to the JSON file containing vote data | Yes |

**Examples:**
```bash
# Import tally data from file
php artisan cx:import-catalyst-tally /path/to/votes_cast.json

# Import from storage directory
php artisan cx:import-catalyst-tally storage/app/fund14_tally.json
```

**What it does:**
- Parses JSON file with vote cast data
- Creates/updates CatalystTally records
- Links votes to proposals by hash

---

## Maintenance Commands

### cx:check-links

Check all links in the database for validity and update their status.

**Signature:**
```bash
php artisan cx:check-links [options]
```

**Options:**
| Option | Description | Default |
|--------|-------------|---------|
| `--batch-size=N` | Number of links per batch | 25 |
| `--timeout=N` | HTTP request timeout in seconds | 10 |
| `--concurrency=N` | Number of concurrent requests | 10 |
| `--delay=N` | Delay between batches in seconds | 0.5 |
| `--force` | Check all links regardless of last check date | false |

**Examples:**
```bash
# Check links that haven't been checked in 29+ days
php artisan cx:check-links

# Force check all links
php artisan cx:check-links --force

# Check with custom settings for slower connections
php artisan cx:check-links --batch-size=10 --timeout=30 --concurrency=5

# Fast check with more concurrency
php artisan cx:check-links --batch-size=50 --concurrency=20 --delay=0.1
```

**What it does:**
- Performs HTTP HEAD requests to validate links
- Updates link validity status in database
- Handles special cases (LinkedIn 999 status, 403 blocked requests)
- Logs invalid and errored links for review

---

### proposals:find-duplicates

Find duplicate proposals and generate a CSV report.

**Signature:**
```bash
php artisan proposals:find-duplicates [options]
```

**Options:**
| Option | Description | Default |
|--------|-------------|---------|
| `--output=FILE` | Output CSV filename | duplicate_proposals.csv |

**Examples:**
```bash
# Find duplicates and save to default file
php artisan proposals:find-duplicates

# Save to custom file
php artisan proposals:find-duplicates --output=duplicates_2024.csv
```

**What it does:**
- Checks for UUID duplicates
- Identifies duplicates by title, ideascale_link, and title+fund combination
- Generates detailed CSV report with duplicate information
- Displays summary statistics

---

## Utility Commands

### job:dispatch

Dispatch a job class by name.

**Signature:**
```bash
php artisan job:dispatch {job}
```

**Arguments:**
| Argument | Description | Required |
|----------|-------------|----------|
| `job` | Job class name (without namespace) | Yes |

**Examples:**
```bash
# Dispatch UpdateTallyRank job
php artisan job:dispatch UpdateTallyRank

# Dispatch SyncProposalJob
php artisan job:dispatch SyncProposalJob
```

**Note:** The job must exist in the `App\Jobs` namespace and have a no-argument constructor.

---

## Quick Reference

### Common Workflows

**Initial Setup / Re-indexing:**
```bash
# Recreate all search indexes
php artisan search:index recreate

# Or step by step:
php artisan search:index delete
php artisan search:index create
php artisan search:index import
```

**Sync All Data for a Fund:**
```bash
# 1. Sync voting results
php artisan voting:sync-from-catalyst --fund=<fund_uuid> --sync --update-details

# 2. Sync reviews
php artisan sync:reviews <fund_uuid> --sync

# 3. Sync milestones
php artisan sync:milestones --sync

# 4. Process historical data
php artisan catalyst:process-historical-funds --fund=<fund_uuid>
```

**Maintenance Tasks:**
```bash
# Check link validity
php artisan cx:check-links

# Find duplicate proposals
php artisan proposals:find-duplicates

# Generate connections
php artisan ln:generate-connections --clear
```

---

## Environment Variables

Some commands require specific environment variables:

| Variable | Description | Used By |
|----------|-------------|---------|
| `MEILISEARCH_HOST` | Meilisearch server URL | search:index, cx:create-search-index |
| `MEILISEARCH_KEY` | Meilisearch API key | search:index, cx:create-search-index |
| `SERVICES_CATALYST_MILESTONE_KEY` | Catalyst Milestone API key | sync:milestones |
| `SERVICES_GOVTOOLS_BUDGET_PROPOSALS` | GovTool API URL | cx:sync-cardano-budget-proposals |

---

## Troubleshooting

### Queue Not Processing
```bash
# Start queue worker
php artisan queue:work

# Monitor queue
php artisan queue:monitor
```

### Search Index Issues
```bash
# Check index status via Meilisearch dashboard or:
php artisan search:index flush <model>
php artisan search:index create <model>
php artisan search:index import <model>
```

### Sync Failures
- Check logs: `tail -f storage/logs/laravel.log`
- Run with `--sync` flag to see real-time errors
- Use `--limit` to process smaller batches for debugging

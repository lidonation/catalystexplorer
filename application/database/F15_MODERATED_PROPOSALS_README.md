# F15 Moderated Proposals Migration

This directory contains scripts to soft delete F15 moderated proposals from the database and remove them from the search index.

## Overview

The migration reads from `sql/f15-moderated-proposals.csv` and:
1. Finds proposals by matching `catalyst_document_id` in the `metas` table
2. Adds a `moderated_reason` meta entry with the moderation reason from CSV
3. Adds a `catalyst_app_url` meta entry if not already present
4. Soft deletes the proposal (sets `deleted_at` timestamp)
5. Removes the proposal from the Meilisearch index
6. All operations are wrapped in a database transaction (all or nothing)

## Files

- `soft_delete_f15_moderated_proposals.php` - Main migration script
- `rollback_f15_moderated_proposals.php` - Rollback script to restore deleted proposals
- `sql/f15-moderated-proposals.csv` - Source data

## Nova Action

A Nova action `RemoveFromSearchIndex` has been added to the Proposals resource. You can use it from the Nova admin panel:

1. Go to Proposals in Nova
2. Select the proposals you want to remove from search
3. Choose "Remove from Search Index" action
4. Confirm the action

This is useful for removing individual proposals or small batches from the search index.

## CSV Format

Expected columns:
- `title` - Proposal title (for logging)
- `catalyst_app_url` - URL to the proposal on Catalyst app
- `projectcatalyst_io_url` - (not used)
- `proposal_id` - The catalyst_document_id to match against
- `catalyst_username` - (not used)
- `proposer_name` - (not used)
- `category` - (not used)
- `funds_requested` - (not used)
- `tags` - (not used)
- `moderated_reason` - Reason for moderation (saved as meta)

## Usage

### Running the Migration

From the project root:

```bash
# Make sure you're in the application directory
cd /Users/ken/dev/www.catalystexplorer.com/application

# Run the migration
php database/soft_delete_f15_moderated_proposals.php
```

Or using Docker:

```bash
# Run inside the container
make artisan exec -- php database/soft_delete_f15_moderated_proposals.php
```

### Rolling Back

If you need to restore the soft deleted proposals:

```bash
# Restore proposals (also adds them back to search index)
php database/rollback_f15_moderated_proposals.php
```

## What the Scripts Do

### Soft Delete Script

1. **Reads CSV**: Parses the CSV file with moderated proposals
2. **Finds Proposals**: Matches each CSV row to a proposal by looking up the `proposal_id` in the `metas` table where `key='catalyst_document_id'`
3. **Adds Meta Data**:
   - Creates `moderated_reason` meta entry (skips "Pending" values)
   - Creates `catalyst_app_url` meta entry if it doesn't already exist
4. **Soft Deletes**: Sets `deleted_at` timestamp on the proposal
5. **Removes from Search Index**: Calls `unsearchable()` to remove from Meilisearch
6. **Reports Progress**: Shows detailed progress and summary

### Rollback Script

1. **Reads CSV**: Parses the same CSV file
2. **Finds Proposals**: Matches proposals the same way (including soft deleted ones)
3. **Removes Meta Data**: Deletes the `moderated_reason` meta entries
4. **Restores Proposals**: Sets `deleted_at` to NULL
5. **Adds to Search Index**: Calls `searchable()` to re-index in Meilisearch
6. **Reports Progress**: Shows detailed progress and summary

## Transaction Safety

Both scripts use database transactions:
- If any error occurs during database operations, all changes are rolled back
- Database remains in consistent state
- Either all proposals are processed or none are
- Search index operations are logged but won't rollback the transaction (as they're external)

## Output

The scripts provide detailed output:
- Row-by-row processing status
- Reasons for skipping rows (not found, already deleted, etc.)
- Progress updates every 10 rows
- Warnings if search index operations fail
- Final summary with counts

Example output:
```
Starting F15 moderated proposals soft deletion...
CSV file found successfully.
Transaction started.
CSV Header: title,catalyst_app_url,projectcatalyst_io_url,proposal_id,...

Processing proposals...
--------------------------------------------------------------------------------
Row 1: SOFT DELETED - [5PC] Cardano Leaders: Vietnam's Crypto Future (Reason: Pending)
Row 2: SOFT DELETED - [CaFi] Catalyst Talk for Vietnamese (Reason: Pending)
...

================================================================================
Summary:
================================================================================
Total rows processed:    200
Proposals soft deleted:  195
Proposals not found:     3
Already deleted:         2
================================================================================

Transaction committed successfully!

✅ F15 moderated proposals soft deletion completed successfully.
```

## Database Schema

### Proposals Table
- `id` - UUID (primary key)
- `deleted_at` - Timestamp for soft deletes (NULL when active)
- `updated_at` - Timestamp of last update

### Metas Table
- `id` - UUID (primary key)
- `model_id` - UUID (foreign key to proposals.id)
- `model_type` - "App\\Models\\Proposal"
- `key` - Meta key (e.g., "catalyst_document_id", "moderated_reason")
- `content` - Meta value
- `created_at` - Timestamp
- `updated_at` - Timestamp

## Search Index

The scripts interact with Meilisearch using Laravel Scout:
- **Index Name**: `cx_proposals`
- **Soft Delete Behavior**: By default, Scout automatically excludes soft-deleted models from the index
- **Manual Removal**: The script explicitly calls `unsearchable()` to ensure immediate removal
- **Restoration**: The rollback script calls `searchable()` to re-index proposals

## Notes

- The script skips proposals with `moderated_reason` of "Pending"
- The `catalyst_app_url` is preserved during rollback as it may be useful
- Soft deleted proposals are not shown in normal queries but remain in the database
- You can permanently delete them later with a hard delete if needed
- The CSV must be located at `database/sql/f15-moderated-proposals.csv`
- Search index operations are separate from the database transaction and logged as warnings if they fail

## Verification

After running the migration, you can verify the results:

```sql
-- Count soft deleted proposals
SELECT COUNT(*) FROM proposals WHERE deleted_at IS NOT NULL;

-- View moderated proposals with their reasons
SELECT p.id, p.title, m.content as moderated_reason, p.deleted_at
FROM proposals p
JOIN metas m ON m.model_id = p.id 
    AND m.model_type = 'App\Models\Proposal'
    AND m.key = 'moderated_reason'
WHERE p.deleted_at IS NOT NULL
ORDER BY p.deleted_at DESC;

-- Check specific proposal by catalyst_document_id
SELECT p.*, m.content as catalyst_doc_id
FROM proposals p
JOIN metas m ON m.model_id = p.id 
    AND m.model_type = 'App\Models\Proposal'
    AND m.key = 'catalyst_document_id'
WHERE m.content = '019abe26-1e60-768f-b8ed-c27f78fc3b9b';
```

### Verify Search Index

You can also verify the search index status:

```bash
# Check if proposals are in the search index
php artisan scout:status "App\Models\Proposal"

# Manually remove a proposal from search (if needed)
php artisan tinker
>>> $proposal = App\Models\Proposal::find('uuid-here');
>>> $proposal->unsearchable();

# Manually add a proposal back to search (if needed)
>>> $proposal = App\Models\Proposal::find('uuid-here');
>>> $proposal->searchable();
```

## Troubleshooting

### CSV File Not Found
- Ensure the CSV is at `database/sql/f15-moderated-proposals.csv`
- Check file permissions

### Database Connection Issues
- Verify environment variables: `DB_HOST`, `DB_PORT`, `DB_DATABASE`, `DB_USERNAME`, `DB_PASSWORD`
- Ensure the database is running

### Proposals Not Found
- The script will report which proposals couldn't be found
- Check if the `catalyst_document_id` exists in the metas table
- Verify the proposal hasn't been deleted from the database

### Transaction Rollback
- If the script fails, all database changes are automatically rolled back
- Check the error message for details
- Fix the issue and re-run the script

### Search Index Issues
- Search index operations won't cause a transaction rollback
- If search removal fails, you'll see a warning but the script continues
- You can manually remove proposals from the search index using the Nova action or Artisan commands
- Check Meilisearch is running: `docker ps` or check your Meilisearch service
- Verify Scout configuration in `config/scout.php`

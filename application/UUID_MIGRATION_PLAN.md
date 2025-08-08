# Campaign Model UUID Migration Plan

## Overview
This migration converts the Campaign model from using integer IDs to UUID v4 as the primary key. This provides better security, uniqueness, and eliminates the need for hash-based identifiers.

## Migration Files Created

### 1. `2025_01_08_121805_add_uuid_to_campaigns_table.php`
- Adds `uuid` column to campaigns table
- Populates UUIDs for existing records
- Makes UUID column non-nullable

### 2. `2025_01_08_121810_update_proposals_campaign_id_to_uuid.php`
- Updates proposals.campaign_id to reference campaign UUIDs
- Migrates existing foreign key relationships
- Removes old integer campaign_id column

### 3. `2025_01_08_121815_switch_campaigns_to_uuid_primary_key.php`
- Switches campaigns table to use UUID as primary key
- Renames old integer `id` to `legacy_id` for backup
- Renames `uuid` to `id` for cleaner code

### 4. `2025_01_08_121820_add_campaign_foreign_key_constraint.php`
- Adds foreign key constraint between proposals.campaign_id and campaigns.id (UUID)

## Model Updates

### Campaign Model Changes
- Added `HasUuids` trait
- Set `$incrementing = false` and `$keyType = 'string'`
- Removed hash-related functionality (hash appends, HasHashId trait)
- Updated route key name to use 'id' (UUID) instead of 'hash'
- Updated filtering logic to handle UUID searches
- Hidden `legacy_id` field in JSON responses

### Proposal Model Changes
- Removed hash reference from campaign searchable array
- Campaign relationship now uses UUID foreign key

### API Platform Updates
- **Removed custom providers**: `CampaignItemProvider` and `CampaignCollectionProvider` are no longer needed
- API Platform's default providers now handle UUID-based operations automatically
- API resource URI templates remain the same (`/campaigns/{id}`)
- IRI generation now works directly with UUIDs
- Simplified API resource configuration with no custom provider complexity

## Migration Process

1. **Run migrations in order:**
   ```bash
   php artisan migrate --path=database/migrations/2025_01_08_121805_add_uuid_to_campaigns_table.php
   php artisan migrate --path=database/migrations/2025_01_08_121810_update_proposals_campaign_id_to_uuid.php
   php artisan migrate --path=database/migrations/2025_01_08_121815_switch_campaigns_to_uuid_primary_key.php
   php artisan migrate --path=database/migrations/2025_01_08_121820_add_campaign_foreign_key_constraint.php
   ```

2. **Clear caches:**
   ```bash
   php artisan cache:clear
   php artisan config:clear
   php artisan route:clear
   ```

## Benefits

1. **Enhanced Security**: UUIDs are not sequential and harder to guess
2. **Better Performance**: No more hash encoding/decoding overhead
3. **Cleaner Code**: Direct UUID usage instead of hash abstractions
4. **API Consistency**: Same API endpoints but with UUID identifiers
5. **Future-Proof**: Standard UUID implementation ready for distributed systems

## API Changes

### Before (with hash):
- Collection: `GET /api/v1/campaigns`
- Item: `GET /api/v1/campaigns/{hash}` (e.g., `/campaigns/ljra8vqtnd`)

### After (with UUID):
- Collection: `GET /api/v1/campaigns`
- Item: `GET /api/v1/campaigns/{uuid}` (e.g., `/campaigns/550e8400-e29b-41d4-a716-446655440000`)

## Rollback Plan

If needed, migrations can be rolled back in reverse order:
```bash
php artisan migrate:rollback --step=4
```

This will restore the original integer ID structure and hash-based identifiers.

## Testing Recommendations

1. Test campaign collection endpoint: `GET /api/v1/campaigns`
2. Test individual campaign access: `GET /api/v1/campaigns/{uuid}`
3. Verify proposal-campaign relationships still work
4. Check that UUID generation works for new campaigns
5. Verify API Platform IRI generation with UUIDs

# Fund Model UUID Migration

This document outlines the migration process to convert the Fund model's primary key from integer to UUID v4.

## Overview

The migration converts the Fund model to use UUIDs as primary keys while maintaining all relationships and data integrity. This affects:

- Direct foreign key relationships (fund_id columns)
- Polymorphic relationships (model_id columns where model_type = 'App\Models\Fund')
- Self-referencing relationships (parent_id in funds table)

## Affected Tables

### Direct Foreign Key Relationships
- `proposals.fund_id`
- `campaigns.fund_id`
- `milestones.fund_id`
- `proposal_milestones.fund_id`
- `bookmark_collections.fund_id`
- `funds.parent_id` (self-referencing)

### Polymorphic Relationships
- `snapshots.model_id` (where model_type = 'App\Models\Fund')
- `rankings.model_id` (where model_type = 'App\Models\Fund')
- `txes.model_id` (where model_type = 'App\Models\Fund')

## Migration Files

1. `2025_08_09_120000_add_uuid_to_funds_table.php` - Adds UUID column to funds
2. `2025_08_09_120100_add_fund_uuid_to_referencing_tables.php` - Adds UUID columns to referencing tables
3. `2025_08_09_120200_add_uuid_support_for_polymorphic_fund_references.php` - Handles polymorphic references
4. `2025_08_09_120300_switch_funds_to_uuid_primary_key.php` - Switches primary key to UUID
5. `2025_08_09_120400_cleanup_old_fund_id_columns.php` - Removes old integer columns

## Model Changes

### Fund Model
- Added `HasUuids` trait
- Set `$keyType = 'string'`
- Set `$incrementing = false`

### FundFactory
- Added explicit UUID generation in definition
- Imports `Illuminate\Support\Str`

### FundData DTO
- Changed `parent_id` type from `int` to `string`

## Running the Migration

### Option 1: Use the Custom Command (Recommended)

```bash
# Preview the migration plan
php artisan migrate:funds-to-uuid --dry-run

# Run the migration
php artisan migrate:funds-to-uuid
```

### Option 2: Run Migrations Manually

**IMPORTANT: Run these in order and wait for each to complete before running the next:**

```bash
# Phase 1: Add UUID column
php artisan migrate --path=database/migrations/2025_08_09_120000_add_uuid_to_funds_table.php

# Phase 2: Add UUID columns to referencing tables
php artisan migrate --path=database/migrations/2025_08_09_120100_add_fund_uuid_to_referencing_tables.php

# Phase 3: Handle polymorphic references
php artisan migrate --path=database/migrations/2025_08_09_120200_add_uuid_support_for_polymorphic_fund_references.php

# Phase 4: Switch to UUID primary key
php artisan migrate --path=database/migrations/2025_08_09_120300_switch_funds_to_uuid_primary_key.php

# Phase 5: Clean up old columns
php artisan migrate --path=database/migrations/2025_08_09_120400_cleanup_old_fund_id_columns.php
```

## Pre-Migration Checklist

- [ ] **BACKUP YOUR DATABASE** - This is critical!
- [ ] Test the migration on a copy of production data
- [ ] Ensure no active transactions are running
- [ ] Schedule maintenance window if needed
- [ ] Notify team members about the change

## Post-Migration Steps

1. **Clear caches:**
   ```bash
   php artisan cache:clear
   php artisan config:clear
   php artisan route:clear
   php artisan view:clear
   ```

2. **Test critical functionality:**
   - Fund creation/updates
   - Proposal-Fund relationships
   - Campaign-Fund relationships
   - Parent-child Fund relationships
   - Polymorphic lookups (snapshots, rankings, txes)

3. **Update external integrations:**
   - Any API clients expecting integer IDs
   - Data export/import scripts
   - Analytics queries

## Rollback Strategy

The migrations include rollback methods, but **Phase 5 (cleanup) cannot be reversed** as it drops the old integer columns. If you need to rollback:

1. **Before Phase 5:** You can rollback using `php artisan migrate:rollback`
2. **After Phase 5:** You must restore from backup

To rollback manually (before cleanup):

```bash
php artisan migrate:rollback --path=database/migrations/2025_08_09_120300_switch_funds_to_uuid_primary_key.php
php artisan migrate:rollback --path=database/migrations/2025_08_09_120200_add_uuid_support_for_polymorphic_fund_references.php
php artisan migrate:rollback --path=database/migrations/2025_08_09_120100_add_fund_uuid_to_referencing_tables.php
php artisan migrate:rollback --path=database/migrations/2025_08_09_120000_add_uuid_to_funds_table.php
```

## Troubleshooting

### Common Issues

1. **Foreign key constraint errors**
   - Ensure no orphaned records exist before migration
   - Check that all fund_id values have corresponding records in funds table

2. **Migration timeout**
   - For large datasets, increase PHP memory limit and execution time
   - Consider running migrations during low-traffic periods

3. **UUID format issues**
   - Ensure your application is generating valid UUID v4 strings
   - Check that HasUuids trait is properly imported

### Verification Queries

After migration, verify data integrity:

```sql
-- Check that all funds have valid UUIDs
SELECT COUNT(*) FROM funds WHERE id IS NULL OR id = '';

-- Verify foreign key relationships
SELECT COUNT(*) FROM proposals p 
LEFT JOIN funds f ON p.fund_id = f.id 
WHERE p.fund_id IS NOT NULL AND f.id IS NULL;

-- Check polymorphic relationships
SELECT COUNT(*) FROM snapshots s
LEFT JOIN funds f ON s.model_id = f.id::text
WHERE s.model_type = 'App\\Models\\Fund' AND f.id IS NULL;
```

## Performance Considerations

- UUID primary keys are slightly slower than integers for joins
- UUIDs take more storage space (36 characters vs ~10 for integers)
- Benefits: Globally unique, better for distributed systems, no sequential enumeration

## Notes

- The migration uses chunked processing to handle large datasets
- All foreign key constraints are properly maintained
- The migration is designed to be zero-downtime for read operations
- Write operations may be briefly affected during the primary key switch

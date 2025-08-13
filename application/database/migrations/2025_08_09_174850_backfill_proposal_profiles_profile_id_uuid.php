<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        // Only operate if proposal_profiles exists
        if (!Schema::hasTable('proposal_profiles')) {
            return;
        }

        // Strategy A: If ideascale_profile_has_proposal has both the legacy integer id column
        // and a backfilled ideascale_profile_uuid column, join on both to update precisely.
        $hasIphp = Schema::hasTable('ideascale_profile_has_proposal');
        $hasUuidCol = $hasIphp && Schema::hasColumn('ideascale_profile_has_proposal', 'ideascale_profile_uuid');
        $hasLegacyIdCol = $hasIphp && Schema::hasColumn('ideascale_profile_has_proposal', 'ideascale_profile_id');

        if ($hasIphp && $hasUuidCol && $hasLegacyIdCol) {
            // Update where the profile_id in proposal_profiles matches the legacy integer id
            // and replace with the corresponding UUID.
            DB::statement(<<<'SQL'
                UPDATE proposal_profiles pp
                SET profile_id = iphp.ideascale_profile_uuid::text
                FROM ideascale_profile_has_proposal iphp
                WHERE pp.profile_type = 'App\\Models\\IdeascaleProfile'
                  AND pp.proposal_id = iphp.proposal_id
                  AND pp.profile_id ~ '^[0-9]+$' -- legacy integer stored as text
                  AND iphp.ideascale_profile_uuid IS NOT NULL
                  AND iphp.ideascale_profile_id::text = pp.profile_id
            SQL);
        } elseif ($hasIphp && $hasLegacyIdCol && !Schema::hasColumn('ideascale_profile_has_proposal', 'ideascale_profile_uuid')) {
            // Strategy B: Table may have already switched legacy id column to UUID values (rename done),
            // but we no longer have the legacy integer to match on. In this case, only safely update
            // proposals that have exactly one ideascale profile. We map by proposal_id only.
            DB::statement(<<<'SQL'
                WITH single_map AS (
                    SELECT proposal_id, MIN(ideascale_profile_id) AS ideascale_profile_id
                    FROM ideascale_profile_has_proposal
                    GROUP BY proposal_id
                    HAVING COUNT(*) = 1
                )
                UPDATE proposal_profiles pp
                SET profile_id = sm.ideascale_profile_id::text
                FROM single_map sm
                WHERE pp.profile_type = 'App\\Models\\IdeascaleProfile'
                  AND pp.profile_id ~ '^[0-9]+$' -- only update legacy numeric values
                  AND pp.proposal_id = sm.proposal_id
            SQL);
        } else {
            // If the referencing table isn't available, we cannot safely backfill.
            // Leave data as-is.
        }
    }

    public function down(): void
    {
        // No-op: This data backfill is not easily reversible.
    }
};


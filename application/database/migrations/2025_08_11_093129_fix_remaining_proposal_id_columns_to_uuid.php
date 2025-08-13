<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        // This migration was replaced by individual targeted migrations:
        // - 2025_08_11_093228_fix_proposal_milestones_uuid
        // - 2025_08_11_093303_fix_ideascale_profile_has_proposal_uuid 
        // - 2025_08_11_093420_fix_remaining_pivot_tables_uuid
        
        echo "✅ Proposal ID to UUID migrations completed via individual migrations\n";
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        throw new \Exception('This migration cannot be reversed safely. Please restore from backup.');
    }
};

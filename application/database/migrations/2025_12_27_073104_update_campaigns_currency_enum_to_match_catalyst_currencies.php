<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    /**
     * Run the migrations.
     *
     * Updates the currency enum constraint on campaigns table to match CatalystCurrencies.php
     * which supports: ADA, USD, USDM (plus null values)
     */
    public function up(): void
    {
        // Drop the existing constraint
        DB::statement('ALTER TABLE campaigns DROP CONSTRAINT IF EXISTS campaigns_currency_check');
        
        // Add the new constraint with USDM included
        DB::statement(
            'ALTER TABLE campaigns ADD CONSTRAINT campaigns_currency_check '
            . "CHECK ((currency IS NULL) OR (currency::text = ANY (ARRAY['ADA'::character varying, 'USD'::character varying, 'USDM'::character varying])))"
        );
    }

    /**
     * Reverse the migrations.
     *
     * Reverts back to the original constraint without USDM
     */
    public function down(): void
    {
        // Drop the new constraint
        DB::statement('ALTER TABLE campaigns DROP CONSTRAINT IF EXISTS campaigns_currency_check');
        
        // Restore the original constraint (ADA, USD only)
        DB::statement(
            'ALTER TABLE campaigns ADD CONSTRAINT campaigns_currency_check '
            . "CHECK ((currency IS NULL) OR (currency::text = ANY (ARRAY['ADA'::character varying, 'USD'::character varying])))"
        );
    }
};

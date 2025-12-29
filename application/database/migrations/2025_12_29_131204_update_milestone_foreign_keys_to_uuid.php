<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        // First, add temporary UUID columns
        DB::statement("ALTER TABLE milestone_poas_reviews ADD COLUMN milestone_poas_uuid uuid");
        DB::statement("ALTER TABLE milestone_poas_signoffs ADD COLUMN milestone_poas_uuid uuid");

        // Update the UUID columns by looking up the UUID from milestone_poas via api_id (only in production)
        if (app()->environment('production')) {
            DB::statement(
                "UPDATE milestone_poas_reviews SET milestone_poas_uuid = milestone_poas.id "
                . "FROM milestone_poas "
                . "WHERE milestone_poas.api_id = milestone_poas_reviews.milestone_poas_id"
            );

            DB::statement(
                "UPDATE milestone_poas_signoffs SET milestone_poas_uuid = milestone_poas.id "
                . "FROM milestone_poas "
                . "WHERE milestone_poas.api_id = milestone_poas_signoffs.milestone_poas_id"
            );
        }

        // Drop the old bigint columns
        DB::statement("ALTER TABLE milestone_poas_reviews DROP COLUMN milestone_poas_id");
        DB::statement("ALTER TABLE milestone_poas_signoffs DROP COLUMN milestone_poas_id");

        // Rename the UUID columns to milestone_poas_id
        DB::statement("ALTER TABLE milestone_poas_reviews RENAME COLUMN milestone_poas_uuid TO milestone_poas_id");
        DB::statement("ALTER TABLE milestone_poas_signoffs RENAME COLUMN milestone_poas_uuid TO milestone_poas_id");

        // Make them NOT NULL (only in production where data exists)
        if (app()->environment('production')) {
            DB::statement("ALTER TABLE milestone_poas_reviews ALTER COLUMN milestone_poas_id SET NOT NULL");
            DB::statement("ALTER TABLE milestone_poas_signoffs ALTER COLUMN milestone_poas_id SET NOT NULL");
        }
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        // This migration is not easily reversible since we've replaced bigint IDs with UUIDs
        // A proper rollback would require keeping track of the original bigint values
        throw new \Exception('This migration cannot be reversed.');
    }
};

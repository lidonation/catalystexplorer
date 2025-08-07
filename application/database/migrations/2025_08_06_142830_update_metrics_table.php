<?php

use App\Enums\MetricTypes;
use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    public function up(): void
    {
        DB::statement("ALTER TABLE metrics DROP CONSTRAINT IF EXISTS metrics_type_check");

        $values = implode("', '", MetricTypes::toValues());
        DB::statement("ALTER TABLE metrics ADD CONSTRAINT metrics_type_check CHECK (type IN ('$values'))");
    }

    public function down(): void
    {
        // Optional: drop and recreate with the old values if needed
    }
};

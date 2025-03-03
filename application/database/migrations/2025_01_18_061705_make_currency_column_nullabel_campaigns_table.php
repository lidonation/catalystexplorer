<?php

use App\Enums\CatalystCurrencies;
use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('campaigns', function (Blueprint $table) {
            $table->string('currency', 255)->nullable()->change();

            DB::statement('ALTER TABLE campaigns DROP CONSTRAINT campaigns_currency_check');
            DB::statement("ALTER TABLE campaigns ADD CONSTRAINT campaigns_currency_check CHECK (currency IS NULL OR currency IN ('ADA', 'USD'))");

        });
    }

    public function down(): void
    {
        Schema::table('campaigns', function (Blueprint $table) {
            $table->enum('currency', CatalystCurrencies::toValues())->nullable(false)->change();
        });
    }
};

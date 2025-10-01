<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::table('catalyst_tallies', function (Blueprint $table) {
            $table->integer('category_rank')->nullable()->index()->comment('Rank within campaign/category (1 = best)');
            $table->integer('fund_rank')->nullable()->index()->comment('Rank within fund (1 = best)');
            $table->integer('overall_rank')->nullable()->index()->comment('Overall rank across all tallies (1 = best)');

            $table->decimal('chance_approval', 5, 2)->nullable()->index()->comment('Approval chance percentage (0.00-100.00)');
            $table->decimal('chance_funding', 5, 2)->nullable()->index()->comment('Funding chance percentage (0.00-100.00)');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('catalyst_tallies', function (Blueprint $table) {
            $table->dropColumn([
                'category_rank',
                'fund_rank',
                'overall_rank',
                'chance_approval',
                'chance_funding'
            ]);
        });
    }
};

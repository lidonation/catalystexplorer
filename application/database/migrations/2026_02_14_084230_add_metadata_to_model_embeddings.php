<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('model_embeddings', function (Blueprint $table) {
            $table->json('metadata')->nullable()->after('content_hash');
            $table->integer('funding_year')->nullable()->after('metadata');
            $table->string('fund_label')->nullable()->after('funding_year');
            $table->string('campaign_title')->nullable()->after('fund_label');
            $table->boolean('is_funded')->nullable()->after('campaign_title');
            $table->decimal('amount_requested', 20, 2)->nullable()->after('is_funded');
            $table->string('currency', 10)->nullable()->after('amount_requested');
            
            $table->index('funding_year');
            $table->index('fund_label');
            $table->index('is_funded');
            $table->index(['embeddable_type', 'funding_year']);
            $table->index(['embeddable_type', 'fund_label']);
        });
    }

    public function down(): void
    {
        Schema::table('model_embeddings', function (Blueprint $table) {
            $table->dropIndex(['model_embeddings_funding_year_index']);
            $table->dropIndex(['model_embeddings_fund_label_index']);
            $table->dropIndex(['model_embeddings_is_funded_index']);
            $table->dropIndex(['model_embeddings_embeddable_type_funding_year_index']);
            $table->dropIndex(['model_embeddings_embeddable_type_fund_label_index']);
            
            $table->dropColumn([
                'metadata',
                'funding_year', 
                'fund_label',
                'campaign_title',
                'is_funded',
                'amount_requested',
                'currency'
            ]);
        });
    }
};
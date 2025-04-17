<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use App\Models\Nft;
use Illuminate\Support\Facades\Log;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Nft::whereNotNull('preview_link')
            ->whereRaw("preview_link != ''")
            ->chunkById(100, function ($nfts) {
                foreach ($nfts as $nft) {
                    try {
                        if (!$nft->hasMedia('preview') && !empty($nft->preview_link)) {
                            if (filter_var($nft->preview_link, FILTER_VALIDATE_URL)) {
                                $nft->addMediaFromUrl($nft->preview_link)
                                    ->withResponsiveImages()
                                    ->toMediaCollection('preview');
                                    
                            }
                        }
                    } catch (\Exception $e) {
                        Log::error('Error migrating NFT preview_link to media', [
                            'nft_id' => $nft->id,
                            'error' => $e->getMessage()
                        ]);
                    }
                }
            });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        // No schema changes to reverse
    }
};
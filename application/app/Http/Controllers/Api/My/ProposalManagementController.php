<?php

declare(strict_types=1);

namespace App\Http\Controllers\Api\My;

use App\Http\Controllers\Controller;
use App\Http\Requests\UpdateProposalQuickPitchRequest;
use App\Models\Proposal;
use App\Services\VideoService;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;

class ProposalManagementController extends Controller
{
    public function __construct(
        private VideoService $videoService
    ) {}

    /**
     * Update proposal quick pitch
     */
    public function updateQuickPitch(UpdateProposalQuickPitchRequest $request, Proposal $proposal): JsonResponse
    {
        $this->authorize('manage', $proposal);

        $url = $request->validated()['quickpitch'];

        try {
            DB::beginTransaction();

            // Normalize YouTube URLs to youtu.be format
            $normalizedUrl = $this->videoService->normalizeYouTubeUrl($url);

            // Try to get video metadata for duration
            $duration = null;
            try {
                $metadata = $this->videoService->getVideoMetadata($normalizedUrl);
                $duration = $metadata['duration'] ?? null;
            } catch (\Exception $e) {
                Log::warning('Failed to fetch video metadata for proposal quick pitch', [
                    'proposal_id' => $proposal->id,
                    'url' => $normalizedUrl,
                    'error' => $e->getMessage(),
                ]);
                // Continue without duration - we don't want to fail the entire update
            }

            // Update the proposal
            $proposal->update([
                'quickpitch' => $normalizedUrl,
                'quickpitch_length' => $duration,
            ]);

            DB::commit();

            return response()->json([
                'message' => 'Quick pitch updated successfully',
                'data' => [
                    'quickpitch' => $proposal->quickpitch,
                    'quickpitch_length' => $proposal->quickpitch_length,
                ],
            ]);

        } catch (\Exception $e) {
            DB::rollBack();

            Log::error('Failed to update proposal quick pitch', [
                'proposal_id' => $proposal->id,
                'url' => $url,
                'error' => $e->getMessage(),
            ]);

            return response()->json([
                'message' => 'Failed to update quick pitch',
                'error' => $e->getMessage(),
            ], 500);
        }
    }
}

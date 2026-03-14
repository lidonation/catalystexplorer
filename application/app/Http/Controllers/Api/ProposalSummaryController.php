<?php

declare(strict_types=1);

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Proposal;
use App\Tools\ProposalSummaryTool;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;

class ProposalSummaryController extends Controller
{
    public function summarize(Request $request, Proposal $proposal): JsonResponse
    {
        try {
            $tool = new ProposalSummaryTool;

            $result = $tool->execute(
                ['proposal_id' => $proposal->id],
                null,
                null
            );

            $data = json_decode($result, true);

            if (json_last_error() !== JSON_ERROR_NONE) {
                return response()->json([
                    'success' => false,
                    'error' => 'Invalid JSON response from summary tool',
                    'raw_result' => $result,
                ], 500);
            }

            return response()->json($data);

        } catch (\Exception $e) {
            Log::error('ProposalSummaryController error', [
                'proposal_id' => $proposal->id,
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString(),
            ]);

            return response()->json([
                'success' => false,
                'error' => 'Failed to generate summary: '.$e->getMessage(),
            ], 500);
        }
    }
}

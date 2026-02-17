<?php

declare(strict_types=1);

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Tools\ProposalComparisonTool;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class ProposalComparisonController extends Controller
{
    public function compare(Request $request): JsonResponse
    {
        $request->validate([
            'proposal_ids' => 'required|array',
            'proposal_ids.*' => 'required|string',
        ]);

        try {
            $tool = new ProposalComparisonTool;

            // Create minimal context objects for tool execution
            // We'll pass null for now since the tool doesn't actually use these
            $result = $tool->execute(
                ['proposal_ids' => $request->input('proposal_ids')],
                null,
                null
            );

            // The tool returns JSON string, decode it
            $data = json_decode($result, true);

            if (json_last_error() !== JSON_ERROR_NONE) {
                return response()->json([
                    'success' => false,
                    'error' => 'Invalid JSON response from comparison tool',
                    'raw_result' => $result,
                ], 500);
            }

            return response()->json($data);

        } catch (\Exception $e) {
            \Log::error('ProposalComparisonController error', [
                'proposal_ids' => $request->input('proposal_ids'),
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString(),
            ]);

            return response()->json([
                'success' => false,
                'error' => 'Failed to generate comparison: '.$e->getMessage(),
            ], 500);
        }
    }
}

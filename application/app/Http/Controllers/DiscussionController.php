<?php

declare(strict_types=1);

namespace App\Http\Controllers;

use App\Models\Discussion;
use Illuminate\Http\Request;

class DiscussionController extends Controller
{
    public function index()
    {
        $discussions = Discussion::paginate(10);
        return response()->json($discussions);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'model_type' => 'required|string|max:255',
            'model_id' => 'required|integer',
            'published_at' => 'nullable|date',
        ]);

        $discussion = Discussion::create($validated);

        return response()->json($discussion, 201);
    }

    public function show(Discussion $discussion)
    {
        return response()->json($discussion);
    }


    public function update(Request $request, Discussion $discussion)
    {
        $validated = $request->validate([
            'model_type' => 'sometimes|string|max:255',
            'model_id' => 'sometimes|integer',
            'published_at' => 'nullable|date',
        ]);

        $discussion->update($validated);

        return response()->json($discussion);
    }

    public function destroy(Discussion $discussion)
    {
        $discussion->delete();

        return response()->json(['message' => 'Discussion deleted successfully']);
    }
}

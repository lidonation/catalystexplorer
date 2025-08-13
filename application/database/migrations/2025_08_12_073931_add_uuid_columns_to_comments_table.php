<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        // Add new UUID columns
        Schema::table('comments', function (Blueprint $table) {
            $table->uuid('uuid_id')->nullable()->after('id');
            $table->uuid('uuid_commentator_id')->nullable()->after('commentator_id');
            $table->text('text_commentable_id')->nullable()->after('commentable_id');
            $table->uuid('uuid_parent_id')->nullable()->after('parent_id');
        });

        // Generate UUIDs for existing records
        DB::table('comments')->whereNull('uuid_id')->update([
            'uuid_id' => DB::raw('gen_random_uuid()')
        ]);

        // Convert commentator_id bigints to UUIDs by looking up users table
        $commentatorUpdates = DB::select("
            SELECT c.id, u.id as user_uuid 
            FROM comments c
            JOIN users u ON u.old_id = c.commentator_id
            WHERE c.commentator_id IS NOT NULL
        ");
        
        foreach ($commentatorUpdates as $update) {
            DB::table('comments')
                ->where('id', $update->id)
                ->update(['uuid_commentator_id' => $update->user_uuid]);
        }

        // Convert commentable_id to text format
        // For BookmarkCollection references, convert to UUID
        $bookmarkCollectionUpdates = DB::select("
            SELECT c.id, bc.id as collection_uuid
            FROM comments c
            JOIN bookmark_collections bc ON bc.old_id = c.commentable_id
            WHERE c.commentable_type = 'App\\Models\\BookmarkCollection'
        ");
        
        foreach ($bookmarkCollectionUpdates as $update) {
            DB::table('comments')
                ->where('id', $update->id)
                ->update(['text_commentable_id' => $update->collection_uuid]);
        }

        // For other commentable types, convert bigint to text
        DB::table('comments')
            ->whereNotIn('commentable_type', ['App\\Models\\BookmarkCollection'])
            ->whereNull('text_commentable_id')
            ->update([
                'text_commentable_id' => DB::raw('CAST(commentable_id AS TEXT)')
            ]);

        // Convert parent_id references to UUIDs
        $parentUpdates = DB::select("
            SELECT c1.id, c2.uuid_id as parent_uuid
            FROM comments c1
            JOIN comments c2 ON c2.id = c1.parent_id
            WHERE c1.parent_id IS NOT NULL
        ");
        
        foreach ($parentUpdates as $update) {
            DB::table('comments')
                ->where('id', $update->id)
                ->update(['uuid_parent_id' => $update->parent_uuid]);
        }
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('comments', function (Blueprint $table) {
            $table->dropColumn([
                'uuid_id',
                'uuid_commentator_id', 
                'text_commentable_id',
                'uuid_parent_id'
            ]);
        });
    }
};

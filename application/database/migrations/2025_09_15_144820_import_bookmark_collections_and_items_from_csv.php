<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use App\Models\BookmarkCollection;
use App\Models\BookmarkItem;
use App\Models\Proposal;
use App\Models\User;
use App\Models\Fund;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        // Create temporary mapping table first
        Schema::create('temp_collection_mapping', function (Blueprint $table) {
            $table->text('old_id'); // Use text to handle both integers and UUIDs
            $table->uuid('new_id');
            $table->uuid('user_id');
            $table->timestamp('created_at');
        });

        $this->importBookmarkCollections();
        $this->importBookmarkItems();

        // Clean up temporary mapping table
        Schema::dropIfExists('temp_collection_mapping');
    }

    /**
     * Import BookmarkCollections from CSV
     */
    private function importBookmarkCollections(): void
    {
        $csvPath = '/var/www/storage/bookmark_collections.csv';

        if (!file_exists($csvPath)) {
            echo "Warning: CSV file not found at: {$csvPath}\n";
            return;
        }

        $handle = fopen($csvPath, 'r');
        if ($handle === false) {
            echo "Error: Could not open CSV file: {$csvPath}\n";
            return;
        }

        // Skip header row
        $header = fgetcsv($handle);
        $importedCount = 0;
        $skippedCount = 0;

        while (($data = fgetcsv($handle)) !== false) {
            DB::beginTransaction();
            try {
                // Map CSV columns to array keys
                $csvData = array_combine($header, $data);

                // Skip if user_id is empty (required field)
                if (empty($csvData['user_id'])) {
                    $skippedCount++;
                    DB::rollBack();
                    continue;
                }

                // Lookup user - handle both integer old_id and UUID id values
                $user = null;
                if (preg_match('/^[a-f0-9]{8}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{12}$/i', $csvData['user_id'])) {
                    // user_id is a valid UUID, look up by id directly
                    $user = User::where('id', $csvData['user_id'])->first();
                } elseif (is_numeric($csvData['user_id'])) {
                    // user_id is numeric, look up by old_id
                    $user = User::where('old_id', $csvData['user_id'])->first();
                }
                // If user_id is neither a valid UUID nor numeric, skip this record
                
                if (!$user) {
                    $skippedCount++;
                    DB::rollBack();
                    continue;
                }

                // Create new BookmarkCollection with UUID
                $collection = new BookmarkCollection();
                $collection->user_id = $user->id;
                $collection->title = $csvData['title'] ?: 'Untitled Collection'; // Default title if empty
                $collection->content = $csvData['content'] ?? null;
                $collection->color = $csvData['color'] ?: '#666666'; // Default gray color if empty
                $collection->visibility = $csvData['visibility'] ?? 'unlisted';
                $collection->status = $csvData['status'] ?? 'published';
                $collection->type = $csvData['type'] ?? BookmarkCollection::class;
                
                // Handle fund_id - CSV contains actual Fund UUIDs
                $fundId = null;
                if (!empty($csvData['fund_id'])) {
                    // Validate that it's a proper UUID format
                    if (preg_match('/^[a-f0-9]{8}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{12}$/i', $csvData['fund_id'])) {
                        // Check if the fund exists in the database
                        $fund = Fund::where('id', $csvData['fund_id'])->first();
                        if ($fund) {
                            $fundId = $fund->id;
                        }
                    }
                }
                $collection->fund_id = $fundId;
                
                // Map allow_comments values properly
                $allowComments = false;

                if (!empty($csvData['allow_comments'])) {
                    if ($csvData['allow_comments'] === 'everyone') {
                        $allowComments = true;
                    } elseif ($csvData['allow_comments'] === 'only-me') {
                        $allowComments = false;
                    } elseif ($csvData['allow_comments'] === 'no-one') {
                        $allowComments = false;
                    } else {
                        $allowComments = (bool) $csvData['allow_comments'];
                    }
                }
                $collection->allow_comments = $allowComments;
                $collection->created_at = !empty($csvData['created_at']) ? $csvData['created_at'] : now();
                $collection->updated_at = !empty($csvData['updated_at']) ? $csvData['updated_at'] : now();
                $collection->deleted_at = !empty($csvData['deleted_at']) ? $csvData['deleted_at'] : null;

                $collection->save();

                // Store mapping of old ID to new UUID for BookmarkItem import
                DB::table('temp_collection_mapping')->insert([
                    'old_id' => $csvData['id'],
                    'new_id' => $collection->id,
                    'user_id' => $collection->user_id,
                    'created_at' => now()
                ]);

                DB::commit();
                $importedCount++;
            } catch (\Exception $e) {
                DB::rollBack();
                echo "Error importing collection row {$csvData['id']}: " . $e->getMessage() . "\n";
                $skippedCount++;
            }
        }

        fclose($handle);
        echo "BookmarkCollections imported: {$importedCount}, skipped: {$skippedCount}\n";
    }

    /**
     * Import BookmarkItems from CSV
     */
    private function importBookmarkItems(): void
    {
        $csvPath = '/var/www/storage/bookmark_items.csv';

        if (!file_exists($csvPath)) {
            echo "Warning: CSV file not found at: {$csvPath}\n";
            return;
        }

        $handle = fopen($csvPath, 'r');
        if ($handle === false) {
            echo "Error: Could not open CSV file: {$csvPath}\n";
            return;
        }

        // Skip header row
        $header = fgetcsv($handle);
        $importedCount = 0;
        $skippedCount = 0;

        while (($data = fgetcsv($handle)) !== false) {
            DB::beginTransaction();
            try {
                // Map CSV columns to array keys
                $csvData = array_combine($header, $data);

                // Skip if bookmark_collection_id is empty
                if (empty($csvData['bookmark_collection_id'])) {
                    $skippedCount++;
                    DB::rollBack();
                    continue;
                }

                // Check if the collection exists in our mapping
                $collectionMapping = DB::table('temp_collection_mapping')
                    ->where('old_id', $csvData['bookmark_collection_id'])
                    ->first();

                if (!$collectionMapping) {
                    $skippedCount++;
                    DB::rollBack();
                    continue;
                }

                // Check if model_id maps to a valid proposal.old_id
                if (!empty($csvData['model_id']) && $csvData['model_type'] === 'App\\Models\\CatalystExplorer\\Proposal') {
                    $proposal = Proposal::where('old_id', $csvData['model_id'])->first();
                    if (!$proposal) {
                        $skippedCount++;
                        DB::rollBack();
                        continue;
                    }
                    $actualModelId = $proposal->id;
                    $actualModelType = Proposal::class;
                } else {
                    // For other model types, use as-is (might need adjustment based on your data)
                    $actualModelId = $csvData['model_id'];
                    $actualModelType = str_replace('CatalystExplorer\\', '', $csvData['model_type']);
                }

                // Create new BookmarkItem using raw DB insert to avoid model relationship issues
                DB::table('bookmark_items')->insert([
                    'id' => DB::raw('gen_random_uuid()'), // Generate new UUID
                    'bookmark_collection_id' => $collectionMapping->new_id,
                    'user_id' => $collectionMapping->user_id,
                    'model_id' => $actualModelId,
                    'model_type' => $actualModelType,
                    'title' => $csvData['title'] ?? null,
                    'content' => $csvData['content'] ?? null,
                    'action' => !empty($csvData['action']) ? $csvData['action'] : null,
                    'created_at' => !empty($csvData['created_at']) ? $csvData['created_at'] : now(),
                    'updated_at' => !empty($csvData['updated_at']) ? $csvData['updated_at'] : now(),
                    'deleted_at' => !empty($csvData['deleted_at']) ? $csvData['deleted_at'] : null,
                ]);
                DB::commit();
                $importedCount++;
            } catch (\Exception $e) {
                DB::rollBack();
                echo "Error importing item row {$csvData['id']}: " . $e->getMessage() . "\n";
                $skippedCount++;
            }
        }

        fclose($handle);
        echo "BookmarkItems imported: {$importedCount}, skipped: {$skippedCount}\n";
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        // Note: This will only remove the imported data, not the original data
        echo "Warning: This migration cannot be fully reversed as it imports data from CSV files.\n";
        echo "Warning: You would need to manually identify and remove the imported records.\n";
    }
};

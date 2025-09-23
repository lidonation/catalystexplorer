<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        $invalidRecords = DB::table('metas')
            ->whereNotNull('model_id')
            ->whereRaw('model_id !~ \'[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}\'')
            ->count();

        if ($invalidRecords > 0) {
            DB::table('metas')
                ->whereNotNull('model_id')
                ->whereRaw('model_id !~ \'[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}\'')
                ->update(['model_id' => null]);
        }

        DB::statement('ALTER TABLE metas ALTER COLUMN model_id TYPE uuid USING model_id::uuid');
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('metas', function (Blueprint $table) {
            $table->text('model_id')->nullable()->change();
        });
    }
};

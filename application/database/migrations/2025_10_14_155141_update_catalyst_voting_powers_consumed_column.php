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
        // Get the path to the SQL file
        $sqlFilePath = database_path('sql/cx.catalyst_voting_powers_updated.sql');
        
        // Check if the file exists
        if (!file_exists($sqlFilePath)) {
            throw new \Exception("SQL file not found: {$sqlFilePath}");
        }
        
        $this->info('Starting catalyst voting powers consumed column updates...');
        
        // Read the SQL file content
        $sql = file_get_contents($sqlFilePath);
        
        // Split the SQL into individual statements (by semicolon)
        $statements = array_filter(array_map('trim', explode(';', $sql)));
        
        // Filter out comments and empty statements
        $updateStatements = array_filter($statements, function($statement) {
            return !empty($statement) && !str_starts_with($statement, '--') && str_contains(strtoupper($statement), 'UPDATE');
        });
        
        $this->info(sprintf('Found %d UPDATE statements to execute', count($updateStatements)));
        
        // Use a transaction to ensure all updates succeed or none do
        DB::transaction(function() use ($updateStatements) {
            $count = 0;
            foreach ($updateStatements as $statement) {
                try {
                    DB::unprepared($statement . ';');
                    $count++;
                    
                    // Progress indicator every 100 statements
                    if ($count % 100 === 0) {
                        $this->info("Processed {$count} statements...");
                    }
                } catch (\Exception $e) {
                    $this->error("Failed to execute statement: {$statement}");
                    throw $e;
                }
            }
            
            $this->info("Successfully executed {$count} UPDATE statements");
        });
        
        $this->info('Catalyst voting powers consumed column updates completed successfully!');
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        // Note: This migration updates existing data and cannot be easily reversed
        // The consumed column values would need to be restored from a backup
        // or the previous state would need to be stored separately
        
        // For safety, we'll leave this empty and require manual intervention
        // if rollback is needed
        $this->warn('This migration cannot be automatically rolled back. ');
        $this->warn('The consumed column updates cannot be reversed without a backup.');
    }
    
    /**
     * Display an info message during migration
     */
    private function info(string $message): void
    {
        if (app()->runningInConsole()) {
            echo "\n\033[32mINFO: {$message}\033[0m\n";
        }
    }
    
    /**
     * Display an error message during migration
     */
    private function error(string $message): void
    {
        if (app()->runningInConsole()) {
            echo "\n\033[31mERROR: {$message}\033[0m\n";
        }
    }
    
    /**
     * Display a warning message during rollback
     */
    private function warn(string $message): void
    {
        if (app()->runningInConsole()) {
            echo "\n\033[33mWARNING: {$message}\033[0m\n";
        }
    }
};

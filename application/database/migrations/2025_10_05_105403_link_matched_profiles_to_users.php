<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use App\Models\User;
use App\Models\IdeascaleProfile;
use App\Models\CatalystProfile;
use App\Models\Pivot\ClaimedProfile;
use Illuminate\Support\Facades\Log;

return new class extends Migration
{
    /**
     * Run the migrations.
     * 
     * This migration links high and medium-high confidence profile matches
     * to User objects, creating users if they don't exist and linking
     * both IdeascaleProfile and CatalystProfile records via claimed_profiles.
     */
    public function up(): void
    {
        echo "Starting profile matching migration...\n";
        
        // Load the profile matching results
        $matchesFile = base_path('catalyst_ideascale_profile_matches.json');
        
        if (!file_exists($matchesFile)) {
            echo "ERROR: Profile matches file not found: {$matchesFile}\n";
            return;
        }
        
        $matchesData = json_decode(file_get_contents($matchesFile), true);
        $matches = $matchesData['matches'] ?? [];
        
        // Filter for HIGH and MEDIUM-HIGH confidence matches
        $targetMatches = array_filter($matches, function($match) {
            return in_array($match['confidence'], ['HIGH', 'MEDIUM-HIGH']);
        });
        
        echo "Processing " . count($targetMatches) . " high/medium-high confidence matches...\n";
        
        $stats = [
            'users_created' => 0,
            'users_found' => 0,
            'ideascale_claims_created' => 0,
            'catalyst_claims_created' => 0,
            'ideascale_claims_existed' => 0,
            'catalyst_claims_existed' => 0,
            'errors' => 0
        ];
        
        foreach ($targetMatches as $index => $match) {
            try {
                $this->processMatch($match, $stats, $index + 1);
            } catch (Exception $e) {
                $stats['errors']++;
                echo "ERROR processing match {$index}: " . $e->getMessage() . "\n";
                Log::error('Profile matching migration error', [
                    'match_index' => $index,
                    'match' => $match,
                    'error' => $e->getMessage()
                ]);
            }
        }
        
        // Display results
        echo "\n=== MIGRATION RESULTS ===\n";
        echo "Users created: {$stats['users_created']}\n";
        echo "Users found existing: {$stats['users_found']}\n";
        echo "IdeaScale claims created: {$stats['ideascale_claims_created']}\n";
        echo "Catalyst claims created: {$stats['catalyst_claims_created']}\n";
        echo "IdeaScale claims already existed: {$stats['ideascale_claims_existed']}\n";
        echo "Catalyst claims already existed: {$stats['catalyst_claims_existed']}\n";
        echo "Errors: {$stats['errors']}\n";
        
        echo "Profile matching migration completed!\n";
    }
    
    /**
     * Process a single match
     */
    private function processMatch(array $match, array &$stats, int $index): void
    {
        $ideascaleData = $match['ideascale'];
        $catalystData = $match['catalyst'];
        
        echo "Processing match {$index}: {$match['type']} - {$match['matched_on']}\n";
        
        // Find or create user based on IdeaScale profile data
        $user = $this->findOrCreateUser($ideascaleData, $stats);
        
        if (!$user) {
            echo "WARNING: Could not find or create user for match {$index}\n";
            return;
        }
        
        // Find the actual profile models
        $ideascaleProfile = IdeascaleProfile::find($ideascaleData['id']);
        $catalystProfile = CatalystProfile::find($catalystData['id']);
        
        if (!$ideascaleProfile) {
            echo "WARNING: IdeaScale profile not found: {$ideascaleData['id']}\n";
            return;
        }
        
        if (!$catalystProfile) {
            echo "WARNING: Catalyst profile not found: {$catalystData['id']}\n";
            return;
        }
        
        // Create claimed profile relationships if they don't exist
        $this->createClaimedProfile($user, $ideascaleProfile, $stats, 'ideascale');
        $this->createClaimedProfile($user, $catalystProfile, $stats, 'catalyst');
        
        echo "  ✓ Linked {$ideascaleData['name']} and {$catalystData['name']} to user {$user->name}\n";
    }
    
    /**
     * Find or create a user based on IdeaScale profile data
     */
    private function findOrCreateUser(array $ideascaleData, array &$stats): ?User
    {
        $email = $ideascaleData['email'] ?? null;
        $name = $ideascaleData['name'] ?? null;
        
        // First try to find by email if available
        if (!empty($email)) {
            $user = User::where('email', $email)->first();
            if ($user) {
                $stats['users_found']++;
                return $user;
            }
        }
        
        // Then try to find by name if no email match
        if (!empty($name)) {
            $user = User::where('name', $name)->first();
            if ($user) {
                $stats['users_found']++;
                return $user;
            }
        }
        
        // Create new user
        if (empty($name)) {
            echo "WARNING: Cannot create user without name\n";
            return null;
        }
        
        // Generate a unique email if none provided
        $generatedEmail = $email ?: $this->generateUniqueEmail($name, $ideascaleData);
        
        $user = User::create([
            'name' => $name,
            'email' => $generatedEmail,
            'password' => bcrypt(str()->random(32)), // Random password, user will need to reset
            'email_verified_at' => null, // Will need to verify
        ]);
        
        $stats['users_created']++;
        echo "  → Created user: {$name} <{$generatedEmail}>\n";
        
        return $user;
    }
    
    /**
     * Generate a unique email for users without one
     */
    private function generateUniqueEmail(string $name, array $ideascaleData): string
    {
        $username = $ideascaleData['username'] ?? null;
        
        // Use username if available
        if ($username) {
            $baseEmail = strtolower($username) . '@catalystexplorer.generated';
        } else {
            // Use name-based email
            $slug = str($name)->slug()->toString();
            $baseEmail = $slug . '@catalystexplorer.generated';
        }
        
        // Ensure uniqueness
        $counter = 1;
        $email = $baseEmail;
        while (User::where('email', $email)->exists()) {
            $email = str_replace('@catalystexplorer.generated', "+{$counter}@catalystexplorer.generated", $baseEmail);
            $counter++;
        }
        
        return $email;
    }
    
    /**
     * Create a claimed profile relationship if it doesn't exist
     */
    private function createClaimedProfile(User $user, $profile, array &$stats, string $type): void
    {
        $existingClaim = ClaimedProfile::where([
            'user_id' => $user->id,
            'claimable_id' => $profile->id,
            'claimable_type' => get_class($profile),
        ])->first();
        
        if ($existingClaim) {
            $stats[$type . '_claims_existed']++;
            return;
        }
        
        ClaimedProfile::create([
            'user_id' => $user->id,
            'claimable_id' => $profile->id,
            'claimable_type' => get_class($profile),
            'claimed_at' => now(),
        ]);
        
        $stats[$type . '_claims_created']++;
    }
    
    /**
     * Reverse the migrations.
     * 
     * Note: This migration creates data relationships but doesn't create
     * new tables, so rollback will only remove the specific claimed_profiles
     * and users created by this migration. This is complex and risky,
     * so we'll just log a warning.
     */
    public function down(): void
    {
        echo "WARNING: This migration creates users and claimed profile relationships.\n";
        echo "WARNING: Rolling back would require removing specific records, which is risky.\n";
        echo "WARNING: Please manually review and clean up if needed.\n";
        
        // Optionally, you could implement specific rollback logic here
        // that removes only the users/claims created by this migration
        // by tracking them in a separate table or using specific markers
    }
};

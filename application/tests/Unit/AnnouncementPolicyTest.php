<?php declare(strict_types=1);

namespace Tests\Unit;

use App\Models\Announcement;
use App\Models\User;
use App\Policies\AnnouncementPolicy;
use Illuminate\Foundation\Testing\RefreshDatabase;
use PHPUnit\Framework\Attributes\Test;

use Tests\TestCase;

class AnnouncementPolicyTest extends TestCase
{
    use RefreshDatabase;

    protected User $user;
    protected AnnouncementPolicy $policy;

    protected function setUp(): void
    {
        parent::setUp();
        $this->user = User::factory()->create();
        $this->policy = new AnnouncementPolicy();
    }

    #[Test]
    public function user_can_view_specific_announcement()
    {
        $announcement = Announcement::factory()->create(['user_id' => $this->user->id]);

        // Assume the parent::canView() allows this user to view this specific announcement
        $this->assertTrue($this->policy->view($this->user, $announcement));
    }

    #[Test]
    public function user_can_update_own_announcement()
    {
        $announcement = Announcement::factory()->create(['user_id' => $this->user->id]);

        // Assume the parent::canUpdate() allows the user to update their own announcement
        $this->assertTrue($this->policy->update($this->user, $announcement));
    }

    #[Test]
    public function user_cannot_update_other_users_announcement()
    {
        $anotherUser = User::factory()->create();
        $announcement = Announcement::factory()->create(['user_id' => $anotherUser->id]);

        // Assume the parent::canUpdate() does not allow the user to update another user's announcement
        $this->assertFalse($this->policy->update($this->user, $announcement));
    }

    #[Test]
    public function user_can_delete_own_announcement()
    {
        $announcement = Announcement::factory()->create(['user_id' => $this->user->id]);

        // Assume the parent::canDelete() allows the user to delete their own announcement
        $this->assertTrue($this->policy->delete($this->user, $announcement));
    }

    #[Test]

    public function user_cannot_delete_other_users_announcement()
    {
        $anotherUser = User::factory()->create();
        $announcement = Announcement::factory()->create(['user_id' => $anotherUser->id]);

        // Assume the parent::canDelete() does not allow the user to delete another user's announcement
        $this->assertFalse($this->policy->delete($this->user, $announcement));
    }
}

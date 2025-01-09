<?php

declare(strict_types=1);

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
        $this->policy = new AnnouncementPolicy;
    }

    #[Test]
    public function user_can_view_specific_announcement()
    {
        $announcement = Announcement::factory()->create(['user_id' => $this->user->id]);

        $this->assertTrue($this->policy->view($this->user, $announcement));
    }

    #[Test]
    public function user_can_update_own_announcement()
    {
        $announcement = Announcement::factory()->create(['user_id' => $this->user->id]);

        $this->assertTrue($this->policy->update($this->user, $announcement));
    }

    #[Test]
    public function user_cannot_update_other_users_announcement()
    {
        $anotherUser = User::factory()->create();
        $announcement = Announcement::factory()->create(['user_id' => $anotherUser->id]);

        $this->assertFalse($this->policy->update($this->user, $announcement));
    }

    #[Test]
    public function user_can_delete_own_announcement()
    {
        $announcement = Announcement::factory()->create(['user_id' => $this->user->id]);

        $this->assertTrue($this->policy->delete($this->user, $announcement));
    }

    #[Test]
    public function user_cannot_delete_other_users_announcement()
    {
        $anotherUser = User::factory()->create();
        $announcement = Announcement::factory()->create(['user_id' => $anotherUser->id]);

        $this->assertFalse($this->policy->delete($this->user, $announcement));
    }
}

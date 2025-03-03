<?php

declare(strict_types=1);

namespace Tests\Unit;

use App\Enums\PermissionEnum;
use App\Models\Campaign;
use App\Models\User;
use App\Policies\CampaignPolicy;
use Illuminate\Foundation\Testing\RefreshDatabase;
use PHPUnit\Framework\Attributes\Test;
use Spatie\Permission\Models\Permission;
use Tests\TestCase;

class CampaignPolicyTest extends TestCase
{
    use RefreshDatabase;

    protected User $user;

    protected Campaign $campaign;

    protected CampaignPolicy $policy;

    protected function setUp(): void
    {
        parent::setUp();

        // Create the permissions only once, using firstOrCreate to prevent duplicates
        collect(PermissionEnum::toValues())->each(callback: function ($permission) {
            Permission::firstOrCreate(['name' => $permission]);
        });

        // Create fresh user and campaign for each test
        $this->user = User::factory()->create();
        $this->campaign = Campaign::factory()->create();
        $this->policy = new CampaignPolicy;
    }

    #[Test]
    public function it_allows_view_any_when_user_has_permission()
    {
        $this->user->givePermissionTo(PermissionEnum::read_campaigns()->value);
        $this->assertTrue($this->policy->viewAny($this->user));
    }

    #[Test]
    public function it_denies_view_any_when_user_lacks_permission()
    {
        $this->assertFalse($this->policy->viewAny($this->user));
    }

    #[Test]
    public function it_allows_view_when_user_has_permission()
    {
        $this->user->givePermissionTo(PermissionEnum::read_campaigns()->value);
        $this->assertTrue($this->policy->view($this->user, $this->campaign));
    }

    #[Test]
    public function it_denies_view_when_user_lacks_permission()
    {
        $this->assertFalse($this->policy->view($this->user, $this->campaign));
    }

    #[Test]
    public function it_allows_create_when_user_has_permission()
    {
        $this->user->givePermissionTo(PermissionEnum::create_campaigns()->value);
        $this->assertTrue($this->policy->create($this->user));
    }

    #[Test]
    public function it_denies_create_when_user_lacks_permission()
    {
        $this->assertFalse($this->policy->create($this->user));
    }

    #[Test]
    public function it_allows_update_when_user_has_permission()
    {
        $this->user->givePermissionTo(PermissionEnum::update_campaigns()->value);
        $this->assertTrue($this->policy->update($this->user, $this->campaign));
    }

    #[Test]
    public function it_denies_update_when_user_lacks_permission()
    {
        $this->assertFalse($this->policy->update($this->user, $this->campaign));
    }

    #[Test]
    public function it_allows_delete_when_user_has_permission()
    {
        $this->user->givePermissionTo(PermissionEnum::delete_campaigns()->value);
        $this->assertTrue($this->policy->delete($this->user, $this->campaign));
    }

    #[Test]
    public function it_denies_delete_when_user_lacks_permission()
    {
        $this->assertFalse($this->policy->delete($this->user, $this->campaign));
    }

    #[Test]
    public function it_allows_restore_when_user_has_permission()
    {
        $this->user->givePermissionTo(PermissionEnum::restore_campaigns()->value);
        $this->assertTrue($this->policy->restore($this->user, $this->campaign));
    }

    #[Test]
    public function it_denies_restore_when_user_lacks_permission()
    {
        $this->assertFalse($this->policy->restore($this->user, $this->campaign));
    }
}

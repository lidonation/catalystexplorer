<?php
declare(strict_types=1);

namespace tests\Unit;

use App\Enums\PermissionEnum;
use App\Models\Fund;
use App\Models\User;
use App\Policies\FundPolicy;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;
use Database\Seeders\PermissionSeeder;
use PHPUnit\Framework\Attributes\Test;

class FundTest extends TestCase
{
    use RefreshDatabase;

    protected FundPolicy $policy;
    protected User $user;

    protected function setUp(): void
    {
        parent::setUp();

        $this->seed(PermissionSeeder::class);
        $this->policy = new FundPolicy();
        $this->user = User::factory()->create();
    }

    #[Test]
    public function it_allows_user_with_permission_to_view_any_funds()
    {
        $this->user->givePermissionTo(PermissionEnum::read_funds()->value);

        $this->assertTrue($this->policy->viewAny($this->user));
    }

    #[Test]
    public function it_denies_user_without_permission_to_view_any_funds()
    {
        $this->assertFalse($this->policy->viewAny($this->user));
    }

    #[Test]
    public function it_denies_user_without_permission_to_create_funds()
    {
        $this->assertFalse($this->policy->create($this->user));
    }
}


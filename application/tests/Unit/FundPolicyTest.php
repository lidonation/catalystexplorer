<?php

declare(strict_types=1);

namespace tests\Unit;

use App\Enums\PermissionEnum;
use App\Models\User;
use App\Policies\FundPolicy;
use Database\Seeders\PermissionSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use PHPUnit\Framework\Attributes\Test;
use Tests\TestCase;

class FundPolicyTest extends TestCase
{
    use RefreshDatabase;

    protected FundPolicy $policy;

    protected User $user;

    protected function setUp(): void
    {
        parent::setUp();

        $this->seed(PermissionSeeder::class);
        $this->policy = new FundPolicy;
        $this->user = User::factory()->create();
    }


    #[Test]
    public function it_denies_user_without_permission_to_create_funds()
    {
        $this->assertFalse($this->policy->create($this->user));
    }
}

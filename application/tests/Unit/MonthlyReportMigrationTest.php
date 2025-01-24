<?php

declare(strict_types=1);

namespace Tests\Unit;

use Tests\TestCase;
use Illuminate\Support\Facades\Schema;
use PHPUnit\Framework\Attributes\Test;

class MonthlyReportMigrationTest extends TestCase
{
    #[Test]
    public function it_creates_the_monthly_reports_table()
    {
        $this->artisan('migrate');

        $this->assertTrue(Schema::hasTable('monthly_reports'));
    }

    #[Test]
    public function it_has_expected_columns_in_monthly_reports_table()
    {
        $this->artisan('migrate');

        $this->assertTrue(Schema::hasColumns('monthly_reports', [
            'id', 'title', 'content', 'status', 'ideascale_profile_id', 'created_at', 'updated_at', 'deleted_at',
        ]));
    }
}

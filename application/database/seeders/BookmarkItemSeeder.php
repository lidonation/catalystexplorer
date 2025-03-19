<?php

declare(strict_types=1);

namespace Database\Seeders;

use App\Models\BookmarkItem;
use App\Models\User;
use Illuminate\Database\Seeder;

class BookmarkItemSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        BookmarkItem::factory()
            ->count(80)
            ->create();
    }
}

<?php

declare(strict_types=1);

namespace Database\Seeders;

use App\Models\Group;
use Illuminate\Database\Seeder;

class GroupSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
<<<<<<< Updated upstream
    {
        Group::factory()
=======
    { 
        $groups = Group::factory()
>>>>>>> Stashed changes
            ->count(10)
            ->create();
    }
}

<?php

declare(strict_types=1);

namespace Database\Seeders;

use App\Models\Category;
use Illuminate\Database\Seeder;

class CategorySeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        
        for ($i = 1; $i <= 5; $i++) {
            $category = Category::factory()->create();

            Category::factory()->count(3)->create([
                'parent_id' => $category->id,
            ]);
        }
    }
}

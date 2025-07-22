<?php

declare(strict_types=1);

namespace Database\Seeders;

use App\Models\Service;
use App\Models\Category;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class ServiceSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $mainCategories = Category::factory(5)->create();
        
        $allSubcategories = collect();
        
        foreach ($mainCategories as $mainCategory) {
            $subcategories = Category::factory(3)->create([
                'parent_id' => $mainCategory->id
            ]);
            $allSubcategories = $allSubcategories->merge($subcategories);
        }
        
        // Create 50 services
        Service::factory(50)->create()->each(function ($service) use ($allSubcategories) {
            $selectedSubcategories = $allSubcategories->random(random_int(1, 3));
            
            foreach ($selectedSubcategories as $category) {
                $category->services()->attach($service);
            }
        });
    }
}

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
        $this->createRealCategories();

        $allSubcategories = Category::whereNotNull('parent_id')->get();

        Service::factory(50)->create()->each(function ($service) use ($allSubcategories) {
            $selectedSubcategories = $allSubcategories->random(random_int(1, 3));

            foreach ($selectedSubcategories as $category) {
                $category->services()->attach($service);
            }
        });
    }

    private function createRealCategories(): void
    {
        if (Category::where('name', 'Technical Services')->exists()) {
            return;
        }

        $categoryData = [
            'Technical Services' => [
                'Web/App Development',
                'Smart Contract Development',
                'API Integration',
                'Security Audits',
                'Testing & QA',
                'DevOps & Deployment',
                'Database Optimization'
            ],
            'Design Services' => [
                'UI/UX Design',
                'Product Design',
                'Branding / Identity Design'
            ],
            'Research & Strategy' => [
                'User Research',
                'Market Research',
                'Education',
                'Tokenomics Strategy'
            ]
        ];

        foreach ($categoryData as $categoryName => $subcategories) {
            $mainCategory = Category::create([
                'name' => $categoryName,
                'description' => "Professional {$categoryName}",
                'is_active' => true,
            ]);

            foreach ($subcategories as $subCategoryName) {
                Category::create([
                    'parent_id' => $mainCategory->id,
                    'name' => $subCategoryName,
                    'description' => "Professional {$subCategoryName} services",
                    'is_active' => true,
                ]);
            }
        }
    }
}

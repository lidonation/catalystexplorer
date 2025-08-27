<?php

declare(strict_types=1);

namespace Database\Seeders;

use App\Models\Service;
use App\Models\Category;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class ServiceSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $this->createRealCategories();

        $allSubcategories = Category::whereNotNull('parent_id')->get();
        if ($allSubcategories->isNotEmpty()) {
            Service::factory(50)->create()->each(function ($service) use ($allSubcategories) {
                $randomCount = random_int(1, min(3, $allSubcategories->count()));
                $selectedSubcategories = $allSubcategories->random($randomCount);

                foreach ($selectedSubcategories as $category) {
                    DB::table('service_model')->insertOrIgnore([
                        'service_id' => $service->id,
                        'model_id' => $category->id,
                        'model_type' => Category::class,
                    ]);
                }
            });
        } else {
            Service::factory(50)->create();
            $this->command->warn('No subcategories found. Services created without category assignments.');
        }
    }

    private function createRealCategories(): void
    {
        $existingStructure = Category::whereNull('parent_id')
            ->whereIn('name', ['Technical Services', 'Design Services', 'Research & Strategy'])
            ->with('children')
            ->get();

        if ($existingStructure->count() === 3 && $existingStructure->sum(fn($cat) => $cat->children->count()) > 0) {
            $this->command->info('Categories with subcategories already exist. Skipping category creation.');
            return;
        }
        if (Category::exists()) {
            $this->command->info('Clearing existing categories to create proper hierarchy...');
            DB::table('service_model')->where('model_type', Category::class)->delete();
            Category::query()->delete();
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
        $this->command->info('Created categories with hierarchical structure.');
    }
}
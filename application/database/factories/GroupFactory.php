<?php

declare(strict_types=1);

namespace Database\Factories;

use App\Models\Group;
use App\Models\IdeascaleProfile;
use Illuminate\Database\Eloquent\Factories\Factory;
use Illuminate\Support\Str;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\Group>
 */
class GroupFactory extends Factory
{
    protected $model = Group::class;

    public function definition(): array
    {
        $profileCount = IdeascaleProfile::count();
        
        $randomProfile = null;
        if ($profileCount > 0) {
            $randomProfile = IdeascaleProfile::inRandomOrder()->first();
        }
        
        return [
            'id' => Str::uuid()->toString(),
            'owner_id' => $randomProfile?->id,
            'name' => $this->faker->company,
            'bio' => json_encode(['en' => $this->faker->paragraph]),
            'deleted_at' => null,
            'created_at' => now(),
            'updated_at' => now(),
            'slug' => $this->faker->slug,
            'status' => 'active',
            'meta_title' => $this->faker->sentence,
            'website' => $this->faker->url,
            'twitter' => $this->faker->userName,
            'discord' => $this->faker->userName,
            'github' => $this->faker->userName,
        ];
    }
}
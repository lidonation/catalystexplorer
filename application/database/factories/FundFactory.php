<?php

use App\Models\Fund;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;

class FundFactory extends Factory
{
    protected $model = Fund::class;

    public function definition()
    {
        return [
            'user_id' => fn () => User::inRandomOrder()->first()?->id,
            'title' => $this->faker->sentence,
            'meta_title' => $this->faker->sentence,
            'slug' => $this->faker->slug,
            'excerpt' => $this->faker->paragraph,
            'comment_prompt' => $this->faker->text,
            'content' => $this->faker->paragraphs(3, true),
            'amount' => $this->faker->randomFloat(2, 0, 1000),
            'status' => $this->faker->word,
            'launched_at' => now(),
            'parent_id' => null,
            'awarded_at' => null,
            'color' => $this->faker->colorName,
            'label' => $this->faker->word,
            'currency' => 'USD',
            'assessment_started_at' => now(),
        ];
    }
}

<?php

namespace Database\Factories;

use App\Enums\StatusEnum;
use App\Models\Discussion;
use App\Models\Proposal;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;

class DiscussionFactory extends Factory
{
    protected $model = Discussion::class;

    public function definition(): array
    {
        // Dynamically choose a related model (e.g., Proposal, Fund)
        $relatedModel = $this->getRandomRelatedModel();

        return [
            'user_id' => User::inRandomOrder()->first()?->id,
            'model_id' => $relatedModel,
            'model_type' => Proposal::class,
            'status' => $this->faker->randomElement(StatusEnum::toValues()),
            'order' => $this->faker->numberBetween(1, 10),
            'content' => $this->faker->paragraph(),
            'comment_prompt' => $this->faker->sentence(),
            'published_at' => $this->faker->dateTimeBetween('-1 month', 'now'),
        ];
    }

    private function getRandomRelatedModel()
    {
        $models = [
            Proposal::class,
            // Fund::class,
        ];

        $modelClass = $this->faker->randomElement($models);

        return $modelClass::inRandomOrder()->first();
    }
}

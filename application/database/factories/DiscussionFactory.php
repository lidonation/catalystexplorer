<?php

namespace Database\Factories;

use App\Models\User;
use App\Models\Proposal;
use App\Enums\StatusEnum;
use App\Models\Discussion;
use Illuminate\Support\Carbon;
use Illuminate\Database\Eloquent\Factories\Factory;

class DiscussionFactory extends Factory
{
    protected $model = Discussion::class;

    public function definition()
    {
        // Dynamically choose a related model (e.g., Proposal, Fund)
        $relatedModel = $this->getRandomRelatedModel();

        return [
            'user_id' => User::factory(),
            'model_id' => $relatedModel,
            'model_type' => get_class($relatedModel),
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

        return $modelClass::factory()->create();
    }
}

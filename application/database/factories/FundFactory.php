<?php


namespace Database\Factories;

use Illuminate\Database\Eloquent\Factories\Factory;
use App\Models\Fund;
use App\Models\User;

class FundFactory extends Factory
{
    /**
     *
     * @var string
     */
    protected $model = Fund::class;

    /**
     *
     * @return array
     */
    public function definition()
    {
        return [
            'user_id' => User::factory(), 
        ];
    }
}

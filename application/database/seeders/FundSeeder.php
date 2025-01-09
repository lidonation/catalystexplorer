<?php declare(strict_types=1);

namespace Database\Seeders;
use Carbon\Carbon;
use App\Models\Fund;
use App\Models\User;
use Database\Seeders\Traits\GetImageLink;
use Illuminate\Database\Eloquent\Factories\Sequence;
use Illuminate\Database\Seeder;

class FundSeeder extends Seeder
{
    use GetImageLink;

    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $date = Carbon::make(now());
        $funds = Fund::factory()
            ->count(5)
            ->recycle(User::factory()->create())
            ->sequence(fn (Sequence $sequence) => [
                'launched_at' => $date->subMonths($sequence->count + 1),
            ])
            ->create();
        $funds->each(function (Fund $fund) {
            if ($imageLink = $this->getRandomImageLink()) {
                $fund->addMediaFromUrl($imageLink)->toMediaCollection('hero');
            }
        });
    }
}

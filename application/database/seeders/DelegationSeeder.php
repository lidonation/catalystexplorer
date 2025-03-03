<?php

namespace Database\Seeders;

use App\Models\Delegation;
use App\Models\Registration;
use Illuminate\Database\Seeder;

class DelegationSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // For each Registration, create 5 related Delegations
        Registration::all()->each(function ($registration) {
            Delegation::factory(5)->create([
                'registration_id' => $registration->id,
            ]);
        });
    }
}

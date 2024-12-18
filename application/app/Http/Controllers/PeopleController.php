<?php

declare(strict_types=1);

namespace App\Http\Controllers;

use App\Repositories\IdeascaleProfileRepository;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class PeopleController extends Controller
{
    /**
     * Display the user's profile form.
     */
    protected int $limit = 36;


    public function index(Request $request): Response
    {
        $ideascaleProfiles = $this->getPeopleData();

        $ideascaleProfiles = $ideascaleProfiles->map(function ($ideascaleProfile) {
            $ideascaleProfile->own_proposals_count = $ideascaleProfile->own_proposals->count();
            $ideascaleProfile->co_proposals_count = $ideascaleProfile->co_proposals_count;

            return $ideascaleProfile;
        });

        return Inertia::render('People/Index', [
            'people' => $ideascaleProfiles,
        ]);
    }

    public function getPeopleData()
    {
        $ideascaleProfile = app(IdeascaleProfileRepository::class);
        return $ideascaleProfile->getQuery()->inRandomOrder()->limit($this->limit)->get();
    }
}

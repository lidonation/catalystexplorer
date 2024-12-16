<?php declare(strict_types=1);

namespace App\Http\Controllers;

use App\Model\IdeasScaleProfile;
use App\Models\IdeascaleProfile;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class PeopleController extends Controller
{
    /**
     * Display the user's profile form.
     */
    public function index(Request $request): Response
    {
        return Inertia::render('People/Index', [
            'people' => $this->getPeopleData(),
        ]);
    }

    public function getPeopleData(){
        return IdeascaleProfile::take(10)->get();
    }
}

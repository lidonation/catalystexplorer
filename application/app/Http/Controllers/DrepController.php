<?php

declare(strict_types=1);

namespace App\Http\Controllers;

use App\Http\Requests\StoreDrepRequest;
use App\Http\Requests\UpdateDrepRequest;
use App\Models\Drep;
use Inertia\Inertia;
use Illuminate\Http\Request;
use Inertia\Response;

class DrepController
{
    /**
     * Display a landing page.
     */
    public function index(Request $request): Response
    {
        return Inertia::render('Dreps/Index');
    }

    /**
     * Show the form for creating a new resource.
     */
    public function create()
    {
        //
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(StoreDrepRequest $request)
    {
        //
    }

    /**
     * Display the specified resource.
     */
    public function list()
    {
        return Inertia::render('Dreps/DrepList', [
            'filters' => [],
        ]);
    }

    /**
     * Show the form for editing the specified resource.
     */
    public function edit(Drep $drep)
    {
        //
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(UpdateDrepRequest $request, Drep $drep)
    {
        //
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(Drep $drep)
    {
        //
    }
}

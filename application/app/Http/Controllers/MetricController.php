<?php

declare(strict_types=1);

namespace App\Http\Controllers;

use App\Http\Requests\StoreMetricRequest;
use App\Http\Requests\UpdateMetricRequest;
use App\Models\Metric;

class MetricController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        //
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
    public function store(StoreMetricRequest $request)
    {
        //
    }

    /**
     * Display the specified resource.
     */
    public function show(Metric $metric)
    {
        //
    }

    /**
     * Show the form for editing the specified resource.
     */
    public function edit(Metric $metric)
    {
        //
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(UpdateMetricRequest $request, Metric $metric)
    {
        //
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(Metric $metric)
    {
        //
    }
}

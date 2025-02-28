<?php

declare(strict_types=1);

namespace App\Nova;

use App\Models\Link;
use App\Models\Location;
use Laravel\Nova\Fields\Field;
use Laravel\Nova\Fields\ID;
use Laravel\Nova\Fields\MorphTo;
use Laravel\Nova\Fields\MorphToMany;
use Laravel\Nova\Fields\Number;
use Laravel\Nova\Fields\Text;
use Laravel\Nova\Http\Requests\NovaRequest;

class Locations extends Resource
{
    /**
     * The model the resource corresponds to.
     *
     * @var class-string<Link>
     */
    public static $model = Location::class;

    /**
     * The columns that should be searched.
     *
     * @var array
     */
    public static $search = [
        'id',
        'lat',
        'long',
        'city',
        'country',
    ];

    public function title()
    {
        return "{$this->lat}, {$this->long} - {$this->city}, {$this->country}";
    }

    /**
     * Get the fields displayed by the resource.
     *
     * @return array<int, Field>
     */
    public function fields(NovaRequest $request): array
    {
        return [
            ID::make(__('ID'), 'id')->sortable(),
            Number::make(__('Latitude'), 'lat'),
            Number::make(__('Longitude'), 'long'),
            Text::make(__('Address 1'), 'address_1'),
            Text::make(__('Address 2'), 'address_2'),
            Text::make(__('City'), 'city'),
            Text::make(__('Street'), 'street'),
            Text::make(__('Region'), 'region'),
            Text::make(__('Country'), 'country'),

            MorphToMany::make(__('Model'), 'model')->types([
                Groups::class,
                IdeascaleProfiles::class
            ]),
        ];
    }
}

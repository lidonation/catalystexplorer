<?php

declare(strict_types=1);

namespace App\Nova;

use App\Models\Category;
use Laravel\Nova\Fields\BelongsTo;
use Laravel\Nova\Fields\Boolean;
use Laravel\Nova\Fields\Field;
use Laravel\Nova\Fields\HasMany;
use Laravel\Nova\Fields\ID;
use Laravel\Nova\Fields\Number;
use Laravel\Nova\Fields\Text;
use Laravel\Nova\Fields\Textarea;
use Laravel\Nova\Http\Requests\NovaRequest;

class Categories extends Resource
{
   
    public static $model = Category::class;

    public static $title = 'name';

    public static $search = [
        'id',
        'name',
        'slug',
    ];

    public function fields(NovaRequest $request): array
    {
        return [
            ID::make()->sortable(),

            Text::make('Name')
                ->sortable()
                ->rules('required', 'max:255'),

            Text::make('Slug')
                ->sortable()
                ->readonly()
                ->hideWhenCreating(),

            Textarea::make('Description')
                ->nullable()
                ->hideFromIndex(),

            BelongsTo::make('Parent Category', 'parent', Categories::class)
                ->nullable()
                ->searchable(),

            Text::make('Type')
                ->readonly()
                ->hideWhenCreating(),

            Number::make('Level')
                ->readonly()
                ->hideWhenCreating(),

            Boolean::make('Is Active')
                ->sortable(),

            HasMany::make('Subcategories', 'children', Categories::class),
        ];
    }


}

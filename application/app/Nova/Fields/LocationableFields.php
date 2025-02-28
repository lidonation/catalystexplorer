<?php

declare(strict_types=1);

namespace App\Nova\Fields;

use Illuminate\Database\Eloquent\Model;
use Laravel\Nova\Fields\Text;
use Laravel\Nova\Http\Requests\NovaRequest;

class LocationableFields
{
    /**
     * Get the pivot fields for the relationship.
     *
     * @param  NovaRequest  $request
     * @param  Model  $relatedModel
     * @return array
     */
    public function __invoke($request, $relatedModel)
    {
        return [
            Text::make('Model Type'),
        ];
    }
}

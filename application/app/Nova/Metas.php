<?php

declare(strict_types=1);

namespace App\Nova;

use App\Models\Meta;
use Illuminate\Support\Str;
use Laravel\Nova\Actions\Action;
use Laravel\Nova\Card;
use Laravel\Nova\Fields\Field;
use Laravel\Nova\Fields\Markdown;
use Laravel\Nova\Fields\MorphTo;
use Laravel\Nova\Fields\Text;
use Laravel\Nova\Filters\Filter;
use Laravel\Nova\Http\Requests\NovaRequest;
use Laravel\Nova\Lenses\Lens;

class Metas extends Resource
{
    /**
     * The model the resource corresponds to.
     *
     * @var class-string<Meta>
     */
    public static $model = Meta::class;

    public static $perPageViaRelationship = 25;

    /**
     * The columns that should be searched.
     *
     * @var array
     */
    public static $search = [
        'key',
        'content',
    ];

    public function title(): string
    {
        return "{$this->key}:{$this->content}";
    }

    /**
     * Get the fields displayed by the resource.
     *
     * @return array<int, Field>
     */
    public function fields(NovaRequest $request): array
    {
        $metaFields = [
            Text::make('ID', 'id')->sortable(),
            Text::make(__('Key'), 'key')->sortable()->filterable(),
            Markdown::make(__('Content'), 'content')
                ->alwaysShow()
                ->filterable()
                ->hideFromIndex(),
            Text::make(__('Model Id'), 'model_id')
                ->filterable(),
            Text::make(__('Value'), 'content')
                ->onlyOnIndex()
                ->filterable()
                ->sortable(),
            MorphTo::make(__('Type'), 'model')
                ->types([
                    //                Articles::class,
                    Campaigns::class,
                    IdeascaleProfiles::class,
                    //                Discussions::class,
                    Funds::class,
                    Groups::class,
                    Proposals::class,
                    Reviews::class,
                    Snapshots::class,
                    Users::class,
                ])->searchable()
                ->filterable(),
        ];

        $modelObj = Meta::find(request()->resourceId);

        if (! isset($modelObj)) {
            return $metaFields;
        }

        return $modelObj->metas->map(function ($meta) {
            return Text::make(Str::title($meta->key), $meta->key)
                ->resolveUsing(fn () => $meta->content);
        })->concat(collect($metaFields))->all();
    }

    /**
     * Get the cards available for the resource.
     *
     * @return array<int, Card>
     */
    public function cards(NovaRequest $request): array
    {
        return [];
    }

    /**
     * Get the filters available for the resource.
     *
     * @return array<int, Filter>
     */
    public function filters(NovaRequest $request): array
    {
        return [];
    }

    /**
     * Get the lenses available for the resource.
     *
     * @return array<int, Lens>
     */
    public function lenses(NovaRequest $request): array
    {
        return [];
    }

    /**
     * Get the actions available for the resource.
     *
     * @return array<int, Action>
     */
    public function actions(NovaRequest $request): array
    {
        return [];
    }
}

<?php

declare(strict_types=1);

namespace App\Nova;

use App\Invokables\TruncateValue;
use App\Models\Tx;
use Illuminate\Http\Request;
use Laravel\Nova\Fields\BelongsTo;
use Laravel\Nova\Fields\DateTime;
use Laravel\Nova\Fields\ID;
use Laravel\Nova\Fields\KeyValue;
use Laravel\Nova\Fields\MorphTo;
use Laravel\Nova\Fields\Number;
use Laravel\Nova\Fields\Select;
use Laravel\Nova\Fields\Text;
use Laravel\Nova\Http\Requests\NovaRequest;

class Txs extends Resource
{
    /**
     * The model the resource corresponds to.
     *
     * @var string
     */
    public static $model = Tx::class;

    /**
     * The single value that should be used to represent the resource when being displayed.
     *
     * @var string
     */
    public static $title = 'hash';

    /**
     * The columns that should be searched.
     *
     * @var array
     */
    public static $search = [
        'id',
        'hash',
        'policy',
    ];

    /**
     * Get the fields displayed by the resource.
     */
    public function fields(Request $request): array
    {
        return [
            ID::make(__('ID'), 'id')->sortable(),
            Text::make(__('Hash'))->sortable()
                ->displayUsing(new TruncateValue($request)),
            BelongsTo::make('Author', 'author', User::class)->searchable()->hideFromIndex()
                ->default(function () {
                    return Auth::id();
                }),
            Text::make(__('Policy'), 'policy')->hideFromIndex(),
            Text::make(__('Address')),
            Number::make(__('Quantity')),
            MorphTo::make('model')->types([
                Nfts::class,
            ])->searchable()->nullable(),
            Select::make(__('Status'), 'status')
                ->sortable()
                ->default('pending')
                ->rules(['required'])
                ->options([
                    'draft' => 'Draft',
                    'pending' => 'Pending',
                    'minting' => 'Minting',
                    'minted' => 'Minted',
                    'burnt' => 'Burnt',
                    'blacklisted' => 'Blacklisted',
                ]),
            DateTime::make(__('Minted At'), 'minted_at'),
            KeyValue::make('Metadata', 'metadata')->rules('json')->resolveUsing(function ($object) {
                return collect($object)?->sortKeys();
            }),
        ];
    }

    /**
     * Get the cards available for the request.
     *
     * @return array
     */
    public function cards(Request $request)
    {
        return [];
    }

    /**
     * Get the filters available for the resource.
     */
    public function filters(NovaRequest $request): array
    {
        return [];
    }

    /**
     * Get the lenses available for the resource.
     *
     * @return array
     */
    public function lenses(NovaRequest $request)
    {
        return [];
    }

    public function actions(NovaRequest $request): array
    {
        return [];
    }
}

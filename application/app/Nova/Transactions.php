<?php

declare(strict_types=1);

namespace App\Nova;

use App\Models\Transaction;
use Illuminate\Http\Request;
use Laravel\Nova\Actions\ExportAsCsv;
use Laravel\Nova\Fields\Code;
use Laravel\Nova\Fields\DateTime;
use Laravel\Nova\Fields\ID;
use Laravel\Nova\Fields\KeyValue;
use Laravel\Nova\Fields\Number;
use Laravel\Nova\Fields\Text;
use Laravel\Nova\Http\Requests\NovaRequest;

class Transactions extends Resource
{
    /**
     * The model the resource corresponds to.
     *
     * @var string
     */
    public static $model = Transaction::class;

    /**
     * The single value that should be used to represent the resource when being displayed.
     *
     * @var string
     */
    public static $title = 'tx_hash';

    /**
     * The columns that should be searched.
     *
     * @var array
     */
    public static $search = [
        'id',
        'tx_hash',
    ];

    /**
     * Get the fields displayed by the resource.
     */
    public function fields(Request $request): array
    {
        return [
            ID::make(__('ID'), 'id')->sortable(),
            Text::make(__('Hash'), 'tx_hash')->sortable(),
            Text::make(__('Block')),
            Text::make(__('Type'))
                ->sortable()
                ->filterable(),
            Number::make(__('Epoch'))
                ->sortable()
                ->filterable(),
            DateTime::make(__('Created At'), 'created_at'),
            Number::make(__('Total Output'), 'total_output'),
            Code::make(__('Inputs'), 'inputs')->json(),
            Code::make(__('Outputs'), 'outputs')->json(),
            Code::make(__('Metadata'), 'json_metadata')->json(),
            Code::make(__('Raw Metadata'), 'raw_metadata')->json(),

            KeyValue::make('Raw Metadata', 'raw_metadata')
                ->rules('json')->resolveUsing(function ($object) {
                    return collect($object)?->sortKeys();
                }),

            KeyValue::make('Metadata', 'json_metadata')
                ->rules('json')->resolveUsing(function ($object) {
                    return collect($object)?->sortKeys();
                }),
        ];
    }

    /**
     * Get the actions available for the resource.
     */
    public function actions(NovaRequest $request): array
    {
        return [
            ExportAsCsv::make()->nameable(),
        ];
    }
}

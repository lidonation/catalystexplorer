<?php

declare(strict_types=1);

namespace App\Nova;

use App\Models\Signature;
use Illuminate\Http\Request;
use Laravel\Nova\Fields\BelongsTo;
use Laravel\Nova\Fields\HasMany;
use Laravel\Nova\Fields\Text;
use Laravel\Nova\Resource;

class Signatures extends Resource
{
    /**
     * The model the resource corresponds to.
     *
     * @var class-string<\App\Models\Signature>
     */
    public static $model = Signature::class;

    /**
     * The single value that should be used to represent the resource.
     */
    public static $title = 'stake_key';

    /**
     * The columns that should be searched.
     */
    public static $search = [
        'id',
        'stake_key',
        'stake_address',
        'signature_key',
        'wallet_provider',
    ];

    /**
     * Get the fields displayed by the resource.
     */
    public function fields(Request $request): array
    {
        return [
            Text::make('ID', 'id')
                ->sortable()
                ->readonly()
                ->copyable(),

            Text::make('Stake Key')
                ->sortable()
                ->rules('required', 'max:255'),

            Text::make('Signature')
                ->hideFromIndex()
                ->rules('required'),

            Text::make('Stake Address')
                ->sortable()
                ->rules('required', 'max:255'),

            Text::make('Signature Key')
                ->sortable()
                ->rules('nullable', 'max:255'),

            Text::make('Wallet Provider')
                ->sortable()
                ->rules('nullable', 'max:255'),

            BelongsTo::make('User', resource: Users::class),

            HasMany::make('Transactions', resource: Transactions::class),
        ];
    }
}

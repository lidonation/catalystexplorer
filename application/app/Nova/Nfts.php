<?php

declare(strict_types=1);

namespace App\Nova;

use App\Models\Nft;
use App\Nova\Actions\SyncNftWithNMKR;
use App\Nova\Actions\UpdateModelMedia;
use App\Nova\Filters\NMKRNftsFilter;
use Ebess\AdvancedNovaMediaLibrary\Fields\Images;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Laravel\Nova\Fields\BelongsTo;
use Laravel\Nova\Fields\DateTime;
use Laravel\Nova\Fields\HasMany;
use Laravel\Nova\Fields\ID;
use Laravel\Nova\Fields\KeyValue;
use Laravel\Nova\Fields\Markdown;
use Laravel\Nova\Fields\MorphTo;
use Laravel\Nova\Fields\Number;
use Laravel\Nova\Fields\Select;
use Laravel\Nova\Fields\Text;
use Laravel\Nova\Fields\URL;
use Laravel\Nova\Http\Requests\NovaRequest;
use Laravel\Nova\Panel;

class Nfts extends Resource
{
    /**
     * The model the resource corresponds to.
     *
     * @var string
     */
    public static $model = Nft::class;

    /**
     * The single value that should be used to represent the resource when being displayed.
     *
     * @var string
     */
    public static $title = 'name';

    /**
     * The columns that should be searched.
     *
     * @var array
     */
    public static $search = [
        'id', 'name', 'owner_address', 'policy',
    ];

    /**
     * Get the fields displayed by the resource.
     *
     * @return array
     */
    public function fields(NovaRequest $request)
    {
        return [
            ID::make(__('ID'), 'id')->sortable(),

            Text::make(__('Name'))->maxlength(32)
                ->enforceMaxlength()
                ->translatable()
                ->sortable()->rulesFor('en', [
                    'required',
                ]),

            BelongsTo::make('Author', 'author', Users::class)
                ->searchable()
                ->nullable()
                ->hideFromIndex()
                ->default(function () {
                    return Auth::id();
                }),

            BelongsTo::make('Artist', 'artist', Users::class)->searchable(),
            Text::make(__('Policy'), 'policy')->hideFromIndex(),
            Text::make(__('Owner Address'))->hideFromIndex(),
            Text::make(__('Rarity'))->sortable(),

            Number::make(__('Price'))->sortable(),
            Number::make(__('Quantity'), 'qty')->default(1)->sortable(),

            Text::make(__('Currency'))->default('usd'),

            URL::make(__('Storage URI'), 'storage_link')
                ->nullable()
                ->rules(['required'])
                ->hideFromIndex(),

            MorphTo::make(__('Model'), 'model')->types([
                Users::class,
                IdeascaleProfiles::class,
            ])->searchable()->nullable(),

            Select::make(__('Status'), 'status')
                ->sortable()
                ->default('draft')
                ->rules(['required'])
                ->options([
                    'draft' => 'Draft',
                    'minting' => 'Minting',
                    'minted' => 'Minted',
                    'burnt' => 'Burnt',
                    'blacklisted' => 'Blacklisted',
                ]),

            DateTime::make(__('Minted At'), 'minted_at'),

            new Panel('Media', self::mediaFields()),

            KeyValue::make(__('On-Chain Metadata'), 'metadata')
                ->rules('json')
                ->resolveUsing(function ($object) {
                    return collect($object)?->sortKeys();
                }),

            Markdown::make(__('description'))->translatable()->help(
                'Please limit your input to 63 characters for NFT uploads. Exceeding this limit may affect the upload process. Thank you!'
            ),
            HasMany::make(__('Transactions'), 'txs', Txs::class),
            HasMany::make(__('Metas'), 'metas', Metas::class),
        ];
    }

    /**
     * Get media fields for the resource.
     */
    public static function mediaFields(): array
    {
        return [
            Images::make(__('Preview'), 'preview')
                ->conversionOnDetailView('medium')
                ->conversionOnIndexView('thumbnails')
                ->enableExistingMedia(),

            Images::make(__('Hero'), 'hero')
                ->conversionOnDetailView('preview')
                ->conversionOnIndexView('thumbnail')
                ->enableExistingMedia(),

            URL::make(__('Preview Link (Legacy)'), 'preview_link')
                ->help('Legacy field: Use the Preview media field above instead')
                ->hideFromIndex(),
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
        return [(new NMKRNftsFilter)];
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
        return [
            (new UpdateModelMedia),
            new SyncNftWithNMKR,
        ];
    }
}

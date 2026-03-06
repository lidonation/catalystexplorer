<?php

declare(strict_types=1);

namespace App\Nova;

use App\Models\ModelEmbedding;
use App\Nova\Actions\EditModel;
use Laravel\Nova\Actions\Action;
use Laravel\Nova\Fields\Boolean;
use Laravel\Nova\Fields\Code;
use Laravel\Nova\Fields\DateTime;
use Laravel\Nova\Fields\Field;
use Laravel\Nova\Fields\ID;
use Laravel\Nova\Fields\MorphTo;
use Laravel\Nova\Fields\Number;
use Laravel\Nova\Fields\Text;
use Laravel\Nova\Fields\Textarea;
use Laravel\Nova\Http\Requests\NovaRequest;
use Laravel\Nova\Panel;

class ModelEmbeddings extends Resource
{
    public static $perPageViaRelationship = 25;

    /**
     * The model the resource corresponds to.
     *
     * @var class-string<ModelEmbedding>
     */
    public static $model = ModelEmbedding::class;

    /**
     * The single value that should be used to represent the resource when being displayed.
     *
     * @var string
     */
    public static $title = 'field_name';

    public static $perPageOptions = [25, 50, 100, 250];

    /**
     * The columns that should be searched.
     *
     * @var array
     */
    public static $search = [
        'id',
        'field_name',
        'provider',
        'model',
        'source_text',
        'content_hash',
    ];

    /**
     * Get the fields displayed by the resource.
     *
     * @return array<int, Field>
     */
    public function fields(NovaRequest $request): array
    {
        return [
            ID::make()->sortable(),

            MorphTo::make(__('Embeddable'), 'embeddable')
                ->types([
                    \App\Nova\Proposals::class,
                    \App\Nova\Campaigns::class,
                ])
                ->searchable()
                ->filterable(),

            Text::make(__('Field Name'), 'field_name')
                ->sortable()
                ->required()
                ->filterable(),

            Text::make(__('Provider'))
                ->sortable()
                ->required()
                ->filterable()
                ->help('The AI provider used (e.g., OpenAI, Cohere)'),

            Text::make(__('Model'))
                ->sortable()
                ->required()
                ->filterable()
                ->help('The specific model used for embeddings'),

            Number::make(__('Dimensions'))
                ->sortable()
                ->required()
                ->help('Number of dimensions in the embedding vector'),

            Text::make(__('Content Hash'), 'content_hash')
                ->sortable()
                ->readonly()
                ->help('Hash of the source text for change detection'),

            Number::make(__('Token Count'), 'token_count')
                ->sortable()
                ->help('Number of tokens in the source text'),

            Number::make(__('Embedding Norm'), 'embedding_norm')
                ->sortable()
                ->step(0.0001)
                ->help('L2 norm of the embedding vector'),

            new Panel('Content', [
                Textarea::make(__('Source Text'), 'source_text')
                    ->alwaysShow()
                    ->rows(3)
                    ->help('The text that was embedded'),
            ]),

            new Panel('Metadata', [
                Number::make(__('Funding Year'), 'funding_year')
                    ->sortable()
                    ->filterable()
                    ->nullable(),

                Text::make(__('Fund Label'), 'fund_label')
                    ->sortable()
                    ->filterable()
                    ->nullable(),

                Text::make(__('Campaign Title'), 'campaign_title')
                    ->sortable()
                    ->filterable()
                    ->nullable(),

                Boolean::make(__('Is Funded'), 'is_funded')
                    ->filterable()
                    ->nullable(),

                Number::make(__('Amount Requested'), 'amount_requested')
                    ->sortable()
                    ->nullable()
                    ->help('Amount requested in ADA'),

                Text::make(__('Currency'))
                    ->sortable()
                    ->filterable()
                    ->nullable(),

                Code::make(__('Metadata (JSON)'), 'metadata')
                    ->json()
                    ->nullable()
                    ->help('Additional metadata stored as JSON'),
            ]),

            new Panel('Vector Data', [
                Code::make(__('Embedding Vector'), 'embedding')
                    ->json()
                    ->readonly()
                    ->hideFromIndex()
                    ->help('The actual embedding vector (high-dimensional array)'),
            ]),

            DateTime::make(__('Created At'), 'created_at')
                ->sortable()
                ->filterable(),

            DateTime::make(__('Updated At'), 'updated_at')
                ->sortable()
                ->filterable(),
        ];
    }

    /**
     * Get the cards available for the request.
     *
     * @return array
     */
    public function cards(NovaRequest $request)
    {
        return [];
    }

    /**
     * Get the filters available for the resource.
     *
     * @return array
     */
    public function filters(NovaRequest $request)
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

    /**
     * Get the actions available for the resource.
     *
     * @return array<int, Action>
     */
    public function actions(NovaRequest $request): array
    {
        return [
            (new EditModel),
        ];
    }

    /**
     * Return the location to redirect the user after creation.
     */
    public static function redirectAfterCreate(NovaRequest $request, $resource)
    {
        return '/resources/'.static::uriKey();
    }

    /**
     * Return the location to redirect the user after update.
     */
    public static function redirectAfterUpdate(NovaRequest $request, $resource)
    {
        return '/resources/'.static::uriKey().'/'.$resource->getKey();
    }
}

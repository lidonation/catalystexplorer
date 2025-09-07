<?php

declare(strict_types=1);

namespace App\Nova;

use App\Enums\ServiceTypeEnum;
use App\Models\Service;
use App\Nova\Actions\EditModel;
use App\Nova\Actions\MakeSearchable;
use App\Nova\Filters\ServiceTypeFilter;
use Ebess\AdvancedNovaMediaLibrary\Fields\Images;
use Laravel\Nova\Actions\Action;
use Laravel\Nova\Fields\BelongsTo;
use Laravel\Nova\Fields\BelongsToMany;
use Laravel\Nova\Fields\Field;
use Laravel\Nova\Fields\ID;
use Laravel\Nova\Fields\Select;
use Laravel\Nova\Fields\Text;
use Laravel\Nova\Fields\Textarea;
use Laravel\Nova\Fields\URL;
use Laravel\Nova\Http\Requests\NovaRequest;

class Services extends Resource
{
    public static $perPageViaRelationship = 25;

    public static $with = ['user', 'categories', 'locations'];

    /**
     * The model the resource corresponds to.
     *
     * @var class-string<Service>
     */
    public static $model = Service::class;

    /**
     * The single value that should be used to represent the resource when being displayed.
     *
     * @var string
     */
    public static $title = 'title';

    /**
     * The columns that should be searched.
     *
     * @var array
     */
    public static $search = [
        'id',
        'title',
        'description',
        'name',
        'email',
    ];

    public static $perPageOptions = [25, 50, 100, 250];

    /**
     * Get the fields displayed by the resource.
     *
     * @return array<int, Field>
     */
    public function fields(NovaRequest $request): array
    {
        return [
            ID::make()->sortable(),

            Text::make(__('Title'), 'title')
                ->sortable()
                ->required()
                ->rules('required', 'max:255')
                ->help('The name or title of the service being offered or needed'),

            Textarea::make(__('Description'), 'description')
                ->required()
                ->rules('required')
                ->help('A detailed description of the service')
                ->hideFromIndex(),

            Select::make(__('Type'), 'type')
                ->options(ServiceTypeEnum::toArray())
                ->default(ServiceTypeEnum::offered())
                ->required()
                ->sortable()
                ->filterable()
                ->displayUsingLabels()
                ->help('Whether this service is being offered or is needed'),

            BelongsTo::make(__('User'), 'user', Users::class)
                ->required()
                ->searchable()
                ->filterable()
                ->help('The user who created this service listing'),

            Images::make(__('Header Image'), 'header')
                ->conversionOnDetailView('large')
                ->conversionOnIndexView('thumbnail')
                ->conversionOnForm('thumbnail')
                ->fullSize()
                ->help('Header image for the service (optional)')
                ->hideFromIndex(),

            Text::make(__('Contact Name'), 'name')
                ->nullable()
                ->help('Contact name (optional - falls back to user name if empty)')
                ->hideFromIndex(),

            Text::make(__('Contact Email'), 'email')
                ->nullable()
                ->rules('nullable', 'email')
                ->help('Contact email (optional - falls back to user email if empty)')
                ->hideFromIndex(),

            URL::make(__('Website'), 'website')
                ->nullable()
                ->displayUsing(fn ($url) => $url ? 'Visit Website' : null)
                ->help('Website URL (optional)')
                ->hideFromIndex(),

            URL::make(__('GitHub'), 'github')
                ->nullable()
                ->displayUsing(fn ($url) => $url ? 'View GitHub' : null)
                ->help('GitHub profile or repository URL (optional)')
                ->hideFromIndex(),

            URL::make(__('LinkedIn'), 'linkedin')
                ->nullable()
                ->displayUsing(fn ($url) => $url ? 'View LinkedIn' : null)
                ->help('LinkedIn profile URL (optional)')
                ->hideFromIndex(),

            BelongsToMany::make(__('Categories'), 'categories', Categories::class)
                ->searchable()
                ->help('Categories that this service belongs to'),

            BelongsToMany::make(__('Locations'), 'locations', Locations::class)
                ->searchable()
                ->help('Locations where this service is available or needed'),

            Text::make(__('Effective Contact Details'), function () {
                $details = $this->effective_contact_details;
                $output = '';
                foreach ($details as $key => $value) {
                    if ($value) {
                        $output .= '<strong>'.ucfirst($key).":</strong> {$value}<br>";
                    }
                }

                return $output ?: 'No contact details available';
            })
                ->onlyOnDetail()
                ->asHtml(),
        ];
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
            (new MakeSearchable),
        ];
    }

    /**
     * Get the filters available for the resource.
     */
    public function filters(NovaRequest $request): array
    {
        return [
            new ServiceTypeFilter,
        ];
    }

    /**
     * Get the displayable label of the resource.
     */
    public static function label(): string
    {
        return __('Services');
    }

    /**
     * Get the displayable singular label of the resource.
     */
    public static function singularLabel(): string
    {
        return __('Service');
    }
}

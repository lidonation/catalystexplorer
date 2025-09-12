<?php

declare(strict_types=1);

namespace App\Nova;

use App\Models\User;
use App\Nova\Actions\UpdateModelMedia;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\MergeValue;
use Laravel\Nova\Actions\Action;
use Laravel\Nova\Auth\PasswordValidationRules;
use Laravel\Nova\Card;
use Laravel\Nova\Fields\Field;
use Laravel\Nova\Fields\Gravatar;
use Laravel\Nova\Fields\HasMany;
use Laravel\Nova\Fields\Number;
use Laravel\Nova\Fields\Password;
use Laravel\Nova\Fields\Text;
use Laravel\Nova\Filters\Filter;
use Laravel\Nova\Http\Requests\NovaRequest;
use Laravel\Nova\Lenses\Lens;
use Laravel\Nova\Panel;
use Laravel\Nova\ResourceTool;

class Users extends Resource
{
    use PasswordValidationRules;

    /**
     * The model the resource corresponds to.
     *
     * @var class-string<User>
     */
    public static $model = User::class;

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
        'id', 'name', 'email',
    ];

    /**
     * Get the fields displayed by the resource.
     *
     * @return array<int, Field|Panel|ResourceTool|MergeValue>
     */
    public function fields(NovaRequest $request): array
    {
        return [
            Text::make('ID', 'id')
                ->sortable()
                ->readonly()
                ->copyable(),

            Gravatar::make()->maxWidth(50),

            Text::make('Name')
                ->sortable()
                ->rules('required', 'max:255'),

            Number::make(__('Proposals Count'), function () {
                return $this->proposals()->count();
            })->onlyOnIndex()
                ->sortable(),

            Text::make('Email')
                ->sortable()
                ->rules('required', 'email', 'max:254')
                ->creationRules('unique:users,email')
                ->updateRules('unique:users,email,{{resourceId}}'),

            Password::make('Password')
                ->onlyOnForms()
                ->creationRules($this->passwordRules())
                ->updateRules($this->optionalPasswordRules()),

            Text::make(__('Profile Summary'), function () {
                $catalystCount = $this->claimedProfiles()->count();
                $ideascaleCount = $this->ideascale_profiles()->count();

                return "Catalyst: {$catalystCount}, Ideascale: {$ideascaleCount}";
            })->onlyOnIndex(),

            Text::make(__('Proposal'), function () {
                // Get separate counts for each profile type
                $catalystCount = $this->proposals()
                    ->whereIn('id', function ($query) {
                        $query->select('proposal_id')
                            ->from('proposal_profiles')
                            ->where('profile_type', 'App\\Models\\CatalystProfile');
                    })->count();
                $ideascaleCount = $this->proposals()
                    ->whereIn('id', function ($query) {
                        $query->select('proposal_id')
                            ->from('proposal_profiles')
                            ->where('profile_type', 'App\\Models\\IdeascaleProfile');
                    })->count();

                return "Catalyst: {$catalystCount}, Ideascale: {$ideascaleCount}";
            })->onlyOnDetail(),

            // Profiles Panel
            Panel::make('Claimed Profiles', [
                HasMany::make(__('Catalyst Profiles'), 'claimedProfiles', CatalystProfiles::class),

                HasMany::make(__('Ideascale Profiles'), 'ideascale_profiles', IdeascaleProfiles::class),
            ]),

            // Proposals Panel
            Panel::make('Proposals', [
                HasMany::make(__('Proposals'), 'proposals', Proposals::class),
            ]),
        ];
    }

    /**
     * Get the cards available for the request.
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
        return [
            (new UpdateModelMedia),
        ];
    }
}

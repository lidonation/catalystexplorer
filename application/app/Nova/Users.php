<?php

declare(strict_types=1);

namespace App\Nova;

use App\Models\User;
use Illuminate\Http\Resources\MergeValue;
use Laravel\Nova\Auth\PasswordValidationRules;
use Laravel\Nova\Exceptions\HelperNotSupported;
use Laravel\Nova\Fields\Field;
use Laravel\Nova\Fields\Gravatar;
use Laravel\Nova\Fields\HasMany;
use Laravel\Nova\Fields\Number;
use Laravel\Nova\Fields\Password;
use Laravel\Nova\Fields\Text;
use Laravel\Nova\Http\Requests\NovaRequest;
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
     *
     * @throws HelperNotSupported
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
                $catalystCount = $this->claimed_catalyst_profiles()->count();
                $ideascaleCount = $this->ideascale_profiles()->count();

                return "Catalyst: {$catalystCount}, Ideascale: {$ideascaleCount}";
            })->onlyOnIndex(),

            Text::make(__('Proposal'), function () {
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

            HasMany::make(__('Claimed Profiles'), 'claimed_profiles', ClaimedProfiles::class),

            Panel::make('Proposals', [
                HasMany::make(__('Proposals'), 'proposals', Proposals::class),
            ]),
        ];
    }
}

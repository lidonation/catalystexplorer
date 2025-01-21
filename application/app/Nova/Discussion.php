<?php

declare(strict_types=1);

namespace App\Nova;

use App\Enums\StatusEnum;
use App\Models\Discussion as DiscussionModel;
use App\Models\User;
use Laravel\Nova\Fields\BelongsTo;
use Laravel\Nova\Fields\DateTime;
use Laravel\Nova\Fields\ID;
use Laravel\Nova\Fields\Number;
use Laravel\Nova\Fields\Select;
use Laravel\Nova\Fields\Text;
use Laravel\Nova\Http\Requests\NovaRequest;

class Discussion extends Resource
{
    public static $model = DiscussionModel::class;

    public static $title = 'id';

    public static $search = ['id'];

    public function fields(NovaRequest $request): array
    {
        return [
            ID::make()->sortable(),

            BelongsTo::make('User', 'user', User::class)
                ->nullable()
                ->sortable(),

            Text::make('Model ID', 'model_id')
                ->nullable()
                ->sortable(),

            Text::make('Model Type', 'model_type')
                ->nullable(),

            Select::make('Status', 'status')
                ->options(StatusEnum::toValues())
                ->default(StatusEnum::draft())
                ->sortable(),

            Number::make('Order', 'order')
                ->default(0)
                ->nullable(),

            Text::make('Content', 'content')
                ->nullable(),

            Text::make('Comment Prompt', 'comment_prompt')
                ->nullable(),

            DateTime::make('Published At', 'published_at')
                ->nullable()
                ->format('YYYY-MM-DD HH:mm:ss'),
        ];
    }

    public function cards(NovaRequest $request): array
    {
        return [];
    }

    public function filters(NovaRequest $request): array
    {
        return [];
    }

    public function lenses(NovaRequest $request): array
    {
        return [];
    }

    public function actions(NovaRequest $request): array
    {
        return [];
    }
}

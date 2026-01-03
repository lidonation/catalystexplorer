<?php

declare(strict_types=1);

declare(strict_types=1);

namespace App\Concerns;

use App;
use App\Enums\StatusEnum;
use App\Models\Translation;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Support\Facades\Auth;
use Spatie\Translatable\HasTranslations as BaseHasTranslations;

trait HasTranslations
{
    use BaseHasTranslations {
        getTranslation as baseGetTranslation;
        getTranslations as baseGetTranslations;
    }

    /**
     * Convert the model instance to an array.
     */
    public function toArray(): array
    {
        $attributes = parent::toArray();
        foreach ($this->getTranslatableAttributes() as $field) {
            $attributes[$field] = $this->getTranslation($field, App::getLocale());
        }

        return $attributes;
    }

    public function translations(): HasMany
    {
        return $this->hasMany(Translation::class, 'source_id', 'id')
            ->where('source_type', static::class);
    }

    public function getClaimableTranslationsAttribute()
    {
        return $this->translations?->where('lang', Auth::user()?->meta_info?->translates)
            ->whereNull('user_id');
    }

    public function getUserTranslationWithSiblingsAttribute()
    {
        return $this->translations?->where('lang', Auth::user()?->meta_info?->translates)
            ->where('user_id', Auth::user()->id);
    }

    public function getuserTranslationWithPendingSiblingsAttribute()
    {
        return $this->userTranslationWithSiblings?->where('status', StatusEnum::pending());
    }

    public function getHasPendingTranslationsAttribute(): bool
    {
        return $this->userTranslationsWithPendingSiblings?->where('status', StatusEnum::pending())
            ? true
            : false;
    }
}

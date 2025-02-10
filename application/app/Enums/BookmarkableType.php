<?php

declare(strict_types=1);

namespace App\Enums;

use App\Models\BookmarkCollection;
use App\Models\Group;
use App\Models\IdeascaleProfile;
use App\Models\Proposal;
use App\Models\Review;

enum BookmarkableType: string
{
    case PROPOSALS = 'proposals';
    case IDEASCALE_PROFILES = 'ideascale-profiles';
    case GROUPS = 'groups';
    case REVIEWS = 'reviews';
    case LISTS = 'lists';

    /**
     * Get the fully qualified class name for the bookmarkable type
     */
    public function getModelClass(): string
    {
        return match ($this) {
            self::PROPOSALS => Proposal::class,
            self::IDEASCALE_PROFILES => IdeascaleProfile::class,
            self::GROUPS => Group::class,
            self::REVIEWS => Review::class,
            self::LISTS => BookmarkCollection::class,
        };
    }

    /**
     * Get all bookmarkable types as an associative array
     *
     * @return array<string, string>
     */
    public static function toArray(): array
    {
        return array_reduce(self::cases(), function ($carry, self $type) {
            $carry[$type->value] = $type->getModelClass();

            return $carry;
        }, []);
    }

    /**
     * Check if a given string is a valid bookmarkable type
     */
    public static function isValid(string $type): bool
    {
        return in_array($type, array_column(self::cases(), 'value'));
    }
}

<?php

declare(strict_types=1);

namespace App\Enums;

enum CatalystFunds: string
{
    case ZERO = '0';
    case ONE = '1';
    case TWO = '8aee7892-b6b8-4c26-b413-96b16fd1a382'; // 95
    case THREE = '0dbcc13d-294f-4a0d-b3cf-ed6997babf48'; // 91
    case FOUR = '11bc609d-00ba-4d08-9a81-a902d7c313eb'; // 84
    case FIVE = 'bf4496d8-6472-41ac-ab05-ccdd92960ee0'; // 32
    case SIX = '00278789-c0ab-4298-9928-31bf35b09e40'; // 21
    case SEVEN = '1389b51c-4320-49a6-9385-eb860e7189b9'; // 58
    case EIGHT = '2fbb9439-c74a-4c33-ac37-e8a28a9a2e2c'; // 61
    case NINE = '9031ef94-1d7b-4b29-b921-de73b9dadbce'; // 97
    case TEN = '4890007c-d31c-4561-870f-14388d6b6d2c'; // 113
    case ELEVEN = '72c34fba-3665-4dfa-b6b1-ff72c916dc9c'; // 129
    case TWELVE = 'e4e8ea34-867e-4f19-aea6-55d83ecb4ecd'; // 139
    case THIRTEEN = 'f7ab84cf-504a-43d7-b2fe-c4acd4113528'; // 146
    case FOURTEEN = 'b77b307e-2e83-4f9d-8be1-ba9f600299f3'; // 147

    /**
     * Get all enum values as an array.
     *
     * @return array<string>
     */
    public static function toValues(): array
    {
        return array_column(self::cases(), 'value');
    }

    /**
     * Get all enum values as an array (alias for toValues for backward compatibility).
     *
     * @return array<string>
     */
    public static function toArray(): array
    {
        return self::toValues();
    }

    /**
     * Get all enum names as an array.
     *
     * @return array<string>
     */
    public static function toLabels(): array
    {
        return array_column(self::cases(), 'name');
    }
}

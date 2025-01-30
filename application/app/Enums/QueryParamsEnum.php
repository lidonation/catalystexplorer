<?php

declare(strict_types=1);

namespace App\Enums;

enum QueryParamsEnum: string
{
    const PAGE = 'p';

    const PER_PAGE = 'l';

    const SEARCH = 's';

    const SORTS = 'st';

    const FUNDED_PROPOSALS = 'fp';

    const AWARDED_ADA = 'aa';

    const AWARDED_USD = 'au';

    const PEOPLE = 'pp';

    const TAGS = 'ts';

    const FUNDS = 'fs';
}

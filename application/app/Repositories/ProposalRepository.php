<?php

namespace App\Repositories;

use App\Models\Proposal;

class ProposalRepository extends Repository
{
    public function __construct(Proposal $model)
    {
        parent::__construct($model);
    }
}

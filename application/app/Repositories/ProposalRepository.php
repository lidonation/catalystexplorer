<?php declare(strict_types=1);

namespace App\Repositories;

use App\Models\Proposal;

class ProposalRepository extends Repository
{
    public function __construct(Proposal $model)
    {
        parent::__construct($model);
    }

    public function search()
    {
        return $this->model->search();
    }
}

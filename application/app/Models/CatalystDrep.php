<?php

declare(strict_types=1);

namespace App\Models;

use App\Traits\HasAuthor;
use App\Traits\HasSignatures;
use Illuminate\Database\Eloquent\Casts\Attribute;
use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Support\Facades\DB;

class CatalystDrep extends Model
{
    use HasAuthor, HasSignatures, HasUuids, SoftDeletes;

    public $guarded = [];

    public $appends = ['stake_address', 'voting_power', 'last_active'];

    public function stakeAddress(): Attribute
    {
        return Attribute::make(get: fn() => $this->signatures()?->first()?->stake_address);
    }

    public function lastActive(): Attribute
    {
        return Attribute::make(get: function () {
            return collect($this->voting_history_data)->first()?->fund_title;
        });
    }

    public function votingPower(): Attribute
    {
        return Attribute::make(get: function () {
            return collect($this->voting_history_data)->first()?->voting_power;
        });
    }

    public function votingHistoryData(): Attribute
    {
        return Attribute::make(
            get: function () {
                return DB::select('
                SELECT reg.stake_pub, cvp.voting_power,
                       cs.model_id AS model_id,
                       funds.title AS fund_title
                FROM voting_powers cvp
                JOIN delegations d ON cvp.voter_id = d.cat_onchain_id
                LEFT JOIN snapshots cs ON cvp.snapshot_id = cs.id
                LEFT JOIN registrations reg ON d.registration_id = reg.id
                LEFT JOIN funds ON cs.model_id::bigint = funds.id::text::bigint
                WHERE cvp.consumed = true
                  AND cs.model_id IS NOT NULL
                  AND reg.stake_pub = ?
                GROUP BY reg.stake_pub, funds.created_at, funds.title, cvp.voting_power, cs.model_id
                ORDER BY funds.created_at DESC
            ', [$this->stake_address]);
            }
        );
    }
}

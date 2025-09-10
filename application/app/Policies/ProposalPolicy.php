<?php

declare(strict_types=1);

namespace App\Policies;

use App\Models\CatalystProfile;
use App\Models\IdeascaleProfile;
use App\Models\Proposal;
use App\Models\User;

class ProposalPolicy extends AppPolicy
{
    /**
     * Determine whether the user can view any models.
     */
    public function viewAny(User $user): bool
    {
        return true;
    }

    /**
     * Determine whether the user can view the model.
     */
    public function view(User $user, Proposal $proposal): bool
    {
        return true;
    }

    /**
     * Determine whether the user can create models.
     */
    public function create(User $user): bool
    {
        return parent::canCreate($user);
    }

    /**
     * Determine whether the user can update the model.
     */
    public function update(User $user, Proposal $proposal): bool
    {
        return parent::canUpdate($user, $proposal) || $this->ownsProposal($user, $proposal);
    }

    /**
     * Determine whether the user can manage the model.
     */
    public function manage(User $user, Proposal $proposal): bool
    {
        return $this->update($user, $proposal);
    }

    /**
     * Determine whether the user can delete the model.
     */
    public function delete(User $user, Proposal $proposal): bool
    {
        return parent::canDelete($user, $proposal) || $this->ownsProposal($user, $proposal);
    }

    /**
     * Determine whether the user owns the proposal through their claimed IdeascaleProfiles or CatalystProfiles.
     */
    protected function ownsProposal(User $user, Proposal $proposal): bool
    {
        // Check IdeascaleProfiles
        $userIdeascaleProfiles = IdeascaleProfile::where('claimed_by_uuid', $user->id)->pluck('id')->toArray();
        $proposalIdeascaleProfileIds = $proposal->ideascale_profiles->pluck('id')->toArray();

        if (! empty($userIdeascaleProfiles) && ! empty(array_intersect($userIdeascaleProfiles, $proposalIdeascaleProfileIds))) {
            return true;
        }

        // Check CatalystProfiles
        $userCatalystProfiles = CatalystProfile::where('claimed_by', $user->id)->pluck('id')->toArray();
        $proposalCatalystProfileIds = $proposal->catalyst_profiles->pluck('id')->toArray();

        if (! empty($userCatalystProfiles) && ! empty(array_intersect($userCatalystProfiles, $proposalCatalystProfileIds))) {
            return true;
        }

        return false;
    }
}

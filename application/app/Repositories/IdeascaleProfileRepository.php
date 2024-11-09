<?php

namespace App\Repositories;

use App\DataTransferObjects\IdeascaleProfileData;
use App\Models\IdeascaleProfile;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Database\Eloquent\Model;

class IdeascaleProfileRepository
{
    /**
     * Get all IdeascaleProfile models.
     *
     * @return Collection
     */
    public function all(): Collection
    {
        return IdeascaleProfile::all();
    }

    /**
     * Get an IdeascaleProfile model by ID.
     *
     * @param int $id
     * @return IdeascaleProfile|null
     */
    public function find(int $id): ?IdeascaleProfile
    {
        return IdeascaleProfile::find($id);
    }

    /**
     * Create a new IdeascaleProfile.
     *
     * @param IdeascaleProfileData $profileData
     * @return IdeascaleProfile
     */
    public function create(IdeascaleProfileData $profileData): IdeascaleProfile
    {
        return IdeascaleProfile::create($profileData->toArray());
    }

    /**
     * Update an existing IdeascaleProfile.
     *
     * @param IdeascaleProfile $profile
     * @param IdeascaleProfileData $profileData
     * @return IdeascaleProfile
     */
    public function update(IdeascaleProfile $profile, IdeascaleProfileData $profileData): IdeascaleProfile
    {
        $profile->update($profileData->toArray());
        return $profile;
    }

    /**
     * Delete an IdeascaleProfile.
     *
     * @param IdeascaleProfile $profile
     * @return bool
     */
    public function delete(IdeascaleProfile $profile): bool
    {
        return $profile->delete();
    }
}

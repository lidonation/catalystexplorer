<?php
declare(strict_types=1);

declare(strict_types=1);

namespace App\Policies;

use App\Enums\PermissionEnum;
use App\Models\MonthlyReport;
use App\Models\User;

class MonthlyReportPolicy extends AppPolicy
{
    /**
     * Determine whether the user can view any models.
     */
    public function viewAny(User $user): bool
    {
        return parent::canViewAny($user) || $user->hasAnyPermission([PermissionEnum::read_monthly_reports()->value]);
    }

    /**
     * Determine whether the user can view the model.
     */
    public function view(User $user, MonthlyReport $report): bool
    {
        return parent::canView($user, $report) || $user->hasAnyPermission([PermissionEnum::read_monthly_reports()->value]);
    }

    /**
     * Determine whether the user can create models.
     */
    public function create(User $user): bool
    {
        return parent::canCreate($user) || $user->hasAnyPermission([PermissionEnum::create_monthly_reports()->value]);
    }

    /**
     * Determine whether the user can update the model.
     */
    public function update(User $user, MonthlyReport $report): bool
    {
        return parent::canUpdate($user, $report) || $user->hasAnyPermission([PermissionEnum::update_monthly_reports()->value]);
    }

    /**
     * Determine whether the user can delete the model.
     */
    public function delete(User $user, MonthlyReport $report): bool
    {
        return parent::canDelete($user, $report) || $user->hasAnyPermission([PermissionEnum::delete_monthly_reports()->value]);
    }

    /**
     * Determine whether the user can restore the model.
     */
    public function restore(User $user, MonthlyReport $report): bool
    {
        return parent::canRestore($user, $report) || $user->hasAnyPermission([PermissionEnum::restore_monthly_reports()->value]);
    }
}

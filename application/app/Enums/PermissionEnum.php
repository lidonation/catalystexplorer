<?php

declare(strict_types=1);

namespace App\Enums;

use Spatie\Enum\Laravel\Enum;

/**
 * @method static self create_communities()
 * @method static self create_groups()
 * @method static self create_ideascale_profiles()
 * @method static self create_events()
 * @method static self create_funds()
 * @method static self create_links()
 * @method static self create_metrics()
 * @method static self create_proposals()
 * @method static self create_ratings()
 * @method static self create_reviews()
 * @method static self create_rewards()
 * @method static self create_roles()
 * @method static self create_users()
 * @method static self create_votes()
 * @method static self create_campaigns()
 * @method static self read_communities()
 * @method static self read_groups()
 * @method static self read_ideascale_profiles()
 * @method static self read_funds()
 * @method static self read_media()
 * @method static self read_metrics()
 * @method static self read_permissions()
 * @method static self read_proposals()
 * @method static self read_ratings()
 * @method static self read_reviews()
 * @method static self read_roles()
 * @method static self read_users()
 * @method static self read_campaigns()
 * @method static self update_communities()
 * @method static self update_groups()
 * @method static self update_ideascale_profiles()
 * @method static self update_admins()
 * @method static self update_funds()
 * @method static self update_media()
 * @method static self update_metrics()
 * @method static self update_proposals()
 * @method static self update_ratings()
 * @method static self update_reviews()
 * @method static self update_roles()
 * @method static self update_users()
 * @method static self update_campaigns()
 * @method static self delete_communities()
 * @method static self delete_groups()
 * @method static self delete_ideascale_profiles()
 * @method static self delete_admins()
 * @method static self delete_funds()
 * @method static self delete_metrics()
 * @method static self delete_permissions()
 * @method static self delete_proposals()
 * @method static self delete_ratings()
 * @method static self delete_reviews()
 * @method static self delete_rewards()
 * @method static self delete_roles()
 * @method static self delete_users()
 * @method static self delete_campaigns()
 * @method static self restore_campaigns()
 */
final class PermissionEnum extends Enum
{
    use Traits\HasValues;
}

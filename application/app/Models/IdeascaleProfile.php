namespace App\Models;

use App\Casts\DateFormatCast;
use App\Traits\HasConnections;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Casts\Attribute;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;

class IdeascaleProfile extends Model implements HasMedia
{
    use HasConnections, HasTranslations, InteractsWithMedia, Searchable;

    protected $primaryKey = 'id';

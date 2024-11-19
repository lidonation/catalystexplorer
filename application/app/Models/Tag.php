<?php declare(strict_types=1);

namespace App\Models;

use Illuminate\Database\Eloquent\Casts\Attribute;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;

class Tag extends Taxonomy
{
    public $append = ['url'];

    public function url(): Attribute {
        return Attribute::make(
            get: function () {
                return url("tags/{$this->slug}");
            }
        );
    }

    public function proposals(): BelongsToMany
    {
        return $this->belongsToMany(Proposal::class, ModelTag::class, 'tag_id', 'model_id')
            ->withPivot(['model_type']);
    }
}

<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Link extends Model
{
    protected $fillable = ['uri'];

    public function model()
    {
        return $this->morphTo();
    }
}

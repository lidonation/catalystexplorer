<?php

use App\Models\Comment;
use App\Models\IdeascaleProfile;
use App\Models\Model;
use App\Models\ModelTag;
use App\Models\Pivot\ProposalProfile;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\HasFactory;

arch()
    ->expect('App\Models')
    ->toBeClasses()
    ->toExtend(Model::class)
    ->ignoring([
        User::class,
        IdeascaleProfile::class,
        Comment::class,
        ModelTag::class,
        ProposalProfile::class,
        'App\Models\Scopes',
        'App\Models\Pivot',
    ]);

arch()
    ->expect('App\Models')
    ->not->toUseTrait(HasFactory::class)
    ->ignoring([
        User::class,
        Model::class,
    ]);

arch()
    ->expect('App\Models')
    ->toOnlyBeUsedIn('App\Repositories')
    ->ignoring('App\Models');

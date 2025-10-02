<?php

use Illuminate\Support\Facades\Broadcast;

Broadcast::channel('App.Models.User.{id}', function ($user, $id) {
    return (int) $user->id === (int) $id;
});

// Bookmark collection streaming channels - allow public access
Broadcast::channel('bookmark-collection.{bookmarkCollectionId}.stream', function ($user, $bookmarkCollectionId) {
    // Allow access to all users (authenticated or not) for public streaming
    // Return user info if authenticated, or generic info if not
    return $user ? ['id' => $user->id] : ['id' => null, 'guest' => true];
});

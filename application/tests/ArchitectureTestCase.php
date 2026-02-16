<?php

namespace Tests;

use Illuminate\Foundation\Testing\TestCase as BaseTestCase;

abstract class ArchitectureTestCase extends BaseTestCase
{
    use CreatesApplication;
    
    // Architecture tests don't need database operations
    // This TestCase specifically excludes RefreshDatabase
}
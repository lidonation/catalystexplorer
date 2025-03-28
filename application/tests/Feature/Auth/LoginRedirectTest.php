<?php

test('users are redirected to their intended URL after login', function () {
    $user = \App\Models\User::factory()->create([
        'email' => 'test@example.com',
        'password' => bcrypt('password'),
    ]);
    
    $intendedUrl = 'https://google.com';
    session()->put('url.intended', $intendedUrl);
    
    $response = $this->withSession(['_token' => 'lido'])
        ->post(route('login.store'), [
            'email' => 'test@example.com',
            'password' => 'password',
            '_token' => 'lido',
        ]);

    $this->assertAuthenticated();
    $response->assertRedirect($intendedUrl);
});

test('middleware captures referer URL for non-auth routes', function () {
    $referer = 'https://google.com';
    
    $response = $this->withHeaders([
        'Referer' => $referer
    ])->get(route('home')); 

    $this->assertEquals($referer, session('url.intended'));
});

test('middleware does not capture referer URL for auth routes', function () {
    $middleware = new \App\Http\Middleware\CaptureIntendedUrl();
    
    $request = \Illuminate\Http\Request::create('/login', 'GET');
    
    $request->setRouteResolver(function () {
        return (object) [
            'getName' => fn() => 'login',
            'uri' => 'login'
        ];
    });
    
    $request->headers->set('Referer', 'https://google.com');
    
    $session = new \Illuminate\Session\Store('test', new \Illuminate\Session\ArraySessionHandler(120));
    $request->setLaravelSession($session);
    
    $middleware->handle($request, function ($req) {
        return new \Symfony\Component\HttpFoundation\Response();
    });
    
    expect($request->session()->get('url.intended'))->toBeNull();
});
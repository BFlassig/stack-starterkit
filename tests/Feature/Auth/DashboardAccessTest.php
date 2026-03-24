<?php

use App\Models\User;

test('guests are redirected to login when requesting the dashboard', function () {
    $this->get('/dashboard')->assertRedirect('/login');
});

test('authenticated users can access the dashboard', function () {
    $user = User::factory()->create();

    $this->actingAs($user)->get('/dashboard')->assertOk();
});

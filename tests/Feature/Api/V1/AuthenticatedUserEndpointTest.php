<?php

use App\Models\User;

it('requires sanctum authentication for the v1 user endpoint', function () {
    $this->getJson('/api/v1/user')->assertUnauthorized();
});

it('returns the authenticated user on the v1 user endpoint', function () {
    $user = User::factory()->create();
    $token = $user->createToken('test-token')->plainTextToken;

    $this->withHeader('Authorization', 'Bearer '.$token)
        ->getJson('/api/v1/user')
        ->assertOk()
        ->assertJsonPath('id', $user->id)
        ->assertJsonPath('email', $user->email);
});

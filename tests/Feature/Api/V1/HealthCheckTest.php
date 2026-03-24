<?php

it('returns the v1 API health payload', function () {
    $response = $this->getJson('/api/v1/health');

    $response
        ->assertOk()
        ->assertJsonPath('status', 'ok')
        ->assertJsonPath('version', 'v1')
        ->assertJsonStructure(['timestamp']);
});

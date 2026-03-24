<?php

use App\Http\Controllers\Api\V1\HealthCheckController;
use App\Http\Controllers\Api\V1\UserController;
use Illuminate\Support\Facades\Route;

Route::prefix('v1')
    ->as('api.v1.')
    ->middleware('throttle:api')
    ->group(function (): void {
        Route::get('/health', HealthCheckController::class)->name('health');

        Route::middleware('auth:sanctum')->get('/user', UserController::class)->name('user');
    });

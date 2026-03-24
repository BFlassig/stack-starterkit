<?php

namespace App\OpenApi;

use OpenApi\Attributes as OA;

#[OA\Info(
    version: '1.0.0',
    title: 'Starterkit External API',
    description: 'Versioned REST API for external consumers. Internal app pages use Inertia page props and are intentionally not part of this spec.'
)]
#[OA\Server(
    url: '/api/v1',
    description: 'Versioned API base path'
)]
#[OA\Tag(
    name: 'System',
    description: 'System and health endpoints'
)]
#[OA\Tag(
    name: 'Users',
    description: 'Authenticated user endpoints'
)]
#[OA\SecurityScheme(
    securityScheme: 'sanctum',
    type: 'http',
    scheme: 'bearer',
    bearerFormat: 'Token',
    description: 'Personal access token issued by Laravel Sanctum. Use header: Authorization: Bearer <token>.'
)]
class OpenApiSpec {}

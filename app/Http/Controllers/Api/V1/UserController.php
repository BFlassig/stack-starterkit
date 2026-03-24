<?php

namespace App\Http\Controllers\Api\V1;

use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use OpenApi\Attributes as OA;

class UserController
{
    #[OA\Get(
        path: '/user',
        operationId: 'getAuthenticatedUser',
        summary: 'Return the authenticated user',
        description: 'Returns the currently authenticated user for external API consumers authenticated via Sanctum token.',
        tags: ['Users'],
        security: [['sanctum' => []]],
        responses: [
            new OA\Response(
                response: 200,
                description: 'Authenticated user payload',
                content: new OA\JsonContent(
                    required: ['id', 'name', 'email', 'created_at', 'updated_at'],
                    properties: [
                        new OA\Property(property: 'id', type: 'integer', example: 1),
                        new OA\Property(property: 'name', type: 'string', example: 'Jane Doe'),
                        new OA\Property(property: 'email', type: 'string', format: 'email', example: 'jane@example.com'),
                        new OA\Property(property: 'email_verified_at', type: 'string', format: 'date-time', nullable: true),
                        new OA\Property(property: 'created_at', type: 'string', format: 'date-time'),
                        new OA\Property(property: 'updated_at', type: 'string', format: 'date-time'),
                    ]
                )
            ),
            new OA\Response(response: 401, description: 'Unauthenticated'),
        ]
    )]
    public function __invoke(Request $request): JsonResponse
    {
        return response()->json($request->user());
    }
}

<?php

namespace App\Http\Controllers\Api\V1;

use Illuminate\Http\JsonResponse;
use OpenApi\Attributes as OA;

class HealthCheckController
{
    #[OA\Get(
        path: '/health',
        operationId: 'getHealthStatus',
        summary: 'Health status endpoint',
        description: 'Lightweight health endpoint for uptime probes and operational checks.',
        tags: ['System'],
        responses: [
            new OA\Response(
                response: 200,
                description: 'API is healthy',
                content: new OA\JsonContent(
                    required: ['status', 'version', 'timestamp'],
                    properties: [
                        new OA\Property(property: 'status', type: 'string', example: 'ok'),
                        new OA\Property(property: 'version', type: 'string', example: 'v1'),
                        new OA\Property(property: 'timestamp', type: 'string', format: 'date-time'),
                    ]
                )
            ),
        ]
    )]
    public function __invoke(): JsonResponse
    {
        return response()->json([
            'status' => 'ok',
            'version' => 'v1',
            'timestamp' => now()->toIso8601String(),
        ]);
    }
}

import { queryParams, type RouteQueryOptions, type RouteDefinition } from './../../../../../../wayfinder'
/**
* @see \App\Http\Controllers\Api\V1\HealthCheckController::__invoke
* @see app/Http/Controllers/Api/V1/HealthCheckController.php:31
* @route '/api/v1/health'
*/
const HealthCheckController = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: HealthCheckController.url(options),
    method: 'get',
})

HealthCheckController.definition = {
    methods: ["get","head"],
    url: '/api/v1/health',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\Api\V1\HealthCheckController::__invoke
* @see app/Http/Controllers/Api/V1/HealthCheckController.php:31
* @route '/api/v1/health'
*/
HealthCheckController.url = (options?: RouteQueryOptions) => {
    return HealthCheckController.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\Api\V1\HealthCheckController::__invoke
* @see app/Http/Controllers/Api/V1/HealthCheckController.php:31
* @route '/api/v1/health'
*/
HealthCheckController.get = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: HealthCheckController.url(options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\Api\V1\HealthCheckController::__invoke
* @see app/Http/Controllers/Api/V1/HealthCheckController.php:31
* @route '/api/v1/health'
*/
HealthCheckController.head = (options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: HealthCheckController.url(options),
    method: 'head',
})

export default HealthCheckController
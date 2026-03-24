import { queryParams, type RouteQueryOptions, type RouteDefinition } from './../../../wayfinder'
/**
* @see \App\Http\Controllers\Api\V1\HealthCheckController::__invoke
* @see app/Http/Controllers/Api/V1/HealthCheckController.php:31
* @route '/api/v1/health'
*/
export const health = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: health.url(options),
    method: 'get',
})

health.definition = {
    methods: ["get","head"],
    url: '/api/v1/health',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\Api\V1\HealthCheckController::__invoke
* @see app/Http/Controllers/Api/V1/HealthCheckController.php:31
* @route '/api/v1/health'
*/
health.url = (options?: RouteQueryOptions) => {
    return health.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\Api\V1\HealthCheckController::__invoke
* @see app/Http/Controllers/Api/V1/HealthCheckController.php:31
* @route '/api/v1/health'
*/
health.get = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: health.url(options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\Api\V1\HealthCheckController::__invoke
* @see app/Http/Controllers/Api/V1/HealthCheckController.php:31
* @route '/api/v1/health'
*/
health.head = (options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: health.url(options),
    method: 'head',
})

/**
* @see \App\Http\Controllers\Api\V1\UserController::__invoke
* @see app/Http/Controllers/Api/V1/UserController.php:37
* @route '/api/v1/user'
*/
export const user = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: user.url(options),
    method: 'get',
})

user.definition = {
    methods: ["get","head"],
    url: '/api/v1/user',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\Api\V1\UserController::__invoke
* @see app/Http/Controllers/Api/V1/UserController.php:37
* @route '/api/v1/user'
*/
user.url = (options?: RouteQueryOptions) => {
    return user.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\Api\V1\UserController::__invoke
* @see app/Http/Controllers/Api/V1/UserController.php:37
* @route '/api/v1/user'
*/
user.get = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: user.url(options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\Api\V1\UserController::__invoke
* @see app/Http/Controllers/Api/V1/UserController.php:37
* @route '/api/v1/user'
*/
user.head = (options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: user.url(options),
    method: 'head',
})

const v1 = {
    health: Object.assign(health, health),
    user: Object.assign(user, user),
}

export default v1
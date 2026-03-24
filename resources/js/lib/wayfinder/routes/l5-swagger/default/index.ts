import { queryParams, type RouteQueryOptions, type RouteDefinition, applyUrlDefaults } from './../../../wayfinder'
/**
* @see \L5Swagger\Http\Controllers\SwaggerController::api
* @see vendor/darkaonline/l5-swagger/src/Http/Controllers/SwaggerController.php:92
* @route '/docs/api'
*/
export const api = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: api.url(options),
    method: 'get',
})

api.definition = {
    methods: ["get","head"],
    url: '/docs/api',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \L5Swagger\Http\Controllers\SwaggerController::api
* @see vendor/darkaonline/l5-swagger/src/Http/Controllers/SwaggerController.php:92
* @route '/docs/api'
*/
api.url = (options?: RouteQueryOptions) => {
    return api.definition.url + queryParams(options)
}

/**
* @see \L5Swagger\Http\Controllers\SwaggerController::api
* @see vendor/darkaonline/l5-swagger/src/Http/Controllers/SwaggerController.php:92
* @route '/docs/api'
*/
api.get = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: api.url(options),
    method: 'get',
})

/**
* @see \L5Swagger\Http\Controllers\SwaggerController::api
* @see vendor/darkaonline/l5-swagger/src/Http/Controllers/SwaggerController.php:92
* @route '/docs/api'
*/
api.head = (options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: api.url(options),
    method: 'head',
})

/**
* @see \L5Swagger\Http\Controllers\SwaggerController::docs
* @see vendor/darkaonline/l5-swagger/src/Http/Controllers/SwaggerController.php:34
* @route '/docs/api-docs'
*/
export const docs = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: docs.url(options),
    method: 'get',
})

docs.definition = {
    methods: ["get","head"],
    url: '/docs/api-docs',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \L5Swagger\Http\Controllers\SwaggerController::docs
* @see vendor/darkaonline/l5-swagger/src/Http/Controllers/SwaggerController.php:34
* @route '/docs/api-docs'
*/
docs.url = (options?: RouteQueryOptions) => {
    return docs.definition.url + queryParams(options)
}

/**
* @see \L5Swagger\Http\Controllers\SwaggerController::docs
* @see vendor/darkaonline/l5-swagger/src/Http/Controllers/SwaggerController.php:34
* @route '/docs/api-docs'
*/
docs.get = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: docs.url(options),
    method: 'get',
})

/**
* @see \L5Swagger\Http\Controllers\SwaggerController::docs
* @see vendor/darkaonline/l5-swagger/src/Http/Controllers/SwaggerController.php:34
* @route '/docs/api-docs'
*/
docs.head = (options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: docs.url(options),
    method: 'head',
})

/**
* @see \L5Swagger\Http\Controllers\SwaggerAssetController::asset
* @see vendor/darkaonline/l5-swagger/src/Http/Controllers/SwaggerAssetController.php:26
* @route '/docs/api-docs/asset/{asset}'
*/
export const asset = (args: { asset: string | number } | [asset: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: asset.url(args, options),
    method: 'get',
})

asset.definition = {
    methods: ["get","head"],
    url: '/docs/api-docs/asset/{asset}',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \L5Swagger\Http\Controllers\SwaggerAssetController::asset
* @see vendor/darkaonline/l5-swagger/src/Http/Controllers/SwaggerAssetController.php:26
* @route '/docs/api-docs/asset/{asset}'
*/
asset.url = (args: { asset: string | number } | [asset: string | number ] | string | number, options?: RouteQueryOptions) => {
    if (typeof args === 'string' || typeof args === 'number') {
        args = { asset: args }
    }

    if (Array.isArray(args)) {
        args = {
            asset: args[0],
        }
    }

    args = applyUrlDefaults(args)

    const parsedArgs = {
        asset: args.asset,
    }

    return asset.definition.url
            .replace('{asset}', parsedArgs.asset.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \L5Swagger\Http\Controllers\SwaggerAssetController::asset
* @see vendor/darkaonline/l5-swagger/src/Http/Controllers/SwaggerAssetController.php:26
* @route '/docs/api-docs/asset/{asset}'
*/
asset.get = (args: { asset: string | number } | [asset: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: asset.url(args, options),
    method: 'get',
})

/**
* @see \L5Swagger\Http\Controllers\SwaggerAssetController::asset
* @see vendor/darkaonline/l5-swagger/src/Http/Controllers/SwaggerAssetController.php:26
* @route '/docs/api-docs/asset/{asset}'
*/
asset.head = (args: { asset: string | number } | [asset: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: asset.url(args, options),
    method: 'head',
})

/**
* @see \L5Swagger\Http\Controllers\SwaggerController::oauth2_callback
* @see vendor/darkaonline/l5-swagger/src/Http/Controllers/SwaggerController.php:142
* @route '/api/oauth2-callback'
*/
export const oauth2_callback = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: oauth2_callback.url(options),
    method: 'get',
})

oauth2_callback.definition = {
    methods: ["get","head"],
    url: '/api/oauth2-callback',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \L5Swagger\Http\Controllers\SwaggerController::oauth2_callback
* @see vendor/darkaonline/l5-swagger/src/Http/Controllers/SwaggerController.php:142
* @route '/api/oauth2-callback'
*/
oauth2_callback.url = (options?: RouteQueryOptions) => {
    return oauth2_callback.definition.url + queryParams(options)
}

/**
* @see \L5Swagger\Http\Controllers\SwaggerController::oauth2_callback
* @see vendor/darkaonline/l5-swagger/src/Http/Controllers/SwaggerController.php:142
* @route '/api/oauth2-callback'
*/
oauth2_callback.get = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: oauth2_callback.url(options),
    method: 'get',
})

/**
* @see \L5Swagger\Http\Controllers\SwaggerController::oauth2_callback
* @see vendor/darkaonline/l5-swagger/src/Http/Controllers/SwaggerController.php:142
* @route '/api/oauth2-callback'
*/
oauth2_callback.head = (options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: oauth2_callback.url(options),
    method: 'head',
})

const defaultMethod = {
    api: Object.assign(api, api),
    docs: Object.assign(docs, docs),
    asset: Object.assign(asset, asset),
    oauth2_callback: Object.assign(oauth2_callback, oauth2_callback),
}

export default defaultMethod
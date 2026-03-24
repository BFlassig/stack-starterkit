<?php

use App\Http\Controllers\ProfileController;
use Illuminate\Foundation\Application;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Redis;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;
use Laravel\Sanctum\Sanctum;

Route::get('/', function () {
    $appUrl = (string) config('app.url', request()->getSchemeAndHttpHost());

    $databaseStatus = ['ok' => false, 'message' => 'Unavailable'];
    try {
        DB::connection()->getPdo();
        $databaseStatus = ['ok' => true, 'message' => 'Connected'];
    } catch (Throwable $exception) {
        $databaseStatus = ['ok' => false, 'message' => 'Connection failed'];
    }

    $redisStatus = ['ok' => false, 'message' => 'Unavailable'];
    try {
        $pong = (string) Redis::connection()->ping();
        $redisStatus = ['ok' => str_contains(strtolower($pong), 'pong') || $pong === '1', 'message' => 'Reachable'];
    } catch (Throwable $exception) {
        $redisStatus = ['ok' => false, 'message' => 'Connection failed'];
    }

    $mailHost = (string) config('mail.mailers.smtp.host', '');
    $mailPort = (int) config('mail.mailers.smtp.port', 0);
    $mailStatus = ['ok' => false, 'message' => 'SMTP host/port not configured'];
    if ($mailHost !== '' && $mailPort > 0) {
        $mailSocket = @fsockopen($mailHost, $mailPort, $errno, $errstr, 0.8);
        $mailStatus = ['ok' => is_resource($mailSocket), 'message' => is_resource($mailSocket) ? 'Reachable' : 'Unreachable'];
        if (is_resource($mailSocket)) {
            fclose($mailSocket);
        }
    }

    $queueDriver = (string) config('queue.default', 'sync');
    $queueStatus = [
        'ok' => $queueDriver !== 'sync',
        'message' => $queueDriver !== 'sync' ? "Driver: {$queueDriver}" : 'sync driver enabled',
    ];

    $openApiEnabled = Route::has('l5-swagger.default.api');
    $openApiDocsEnabled = Route::has('l5-swagger.default.docs');
    $openApiUrl = $openApiEnabled ? route('l5-swagger.default.api', absolute: false) : null;
    $openApiDocsUrl = $openApiDocsEnabled ? route('l5-swagger.default.docs', absolute: false) : null;

    $services = [
        ['name' => 'Laravel HTTP', 'ok' => true, 'message' => 'Application booted', 'target' => $appUrl],
        ['name' => 'PostgreSQL', 'ok' => $databaseStatus['ok'], 'message' => $databaseStatus['message'], 'target' => sprintf('%s:%s', (string) config('database.connections.pgsql.host', 'postgres'), (string) config('database.connections.pgsql.port', '5432'))],
        ['name' => 'Redis', 'ok' => $redisStatus['ok'], 'message' => $redisStatus['message'], 'target' => sprintf('%s:%s', (string) config('database.redis.default.host', 'redis'), (string) config('database.redis.default.port', '6379'))],
        ['name' => 'Queue Worker', 'ok' => $queueStatus['ok'], 'message' => $queueStatus['message'], 'target' => $queueDriver],
        ['name' => 'Mail SMTP', 'ok' => $mailStatus['ok'], 'message' => $mailStatus['message'], 'target' => $mailHost !== '' && $mailPort > 0 ? "{$mailHost}:{$mailPort}" : 'not configured'],
    ];

    $modules = [
        ['name' => 'Inertia Internal Flow', 'ok' => true, 'message' => 'Controller -> Page Props'],
        ['name' => 'React 19 + TypeScript', 'ok' => true, 'message' => 'UI runtime through Vite build assets'],
        ['name' => 'External API v1', 'ok' => true, 'message' => 'Versioned routes under /api/v1'],
        ['name' => 'Sanctum', 'ok' => class_exists(Sanctum::class), 'message' => 'Token auth for external API'],
        ['name' => 'OpenAPI Docs', 'ok' => $openApiEnabled && $openApiDocsEnabled, 'message' => $openApiEnabled && $openApiDocsEnabled ? 'Swagger UI and JSON routes available' : 'Swagger route missing'],
    ];

    $pages = [
        ['label' => 'Welcome', 'url' => '/', 'kind' => 'internal', 'section' => 'Core', 'requiresAuth' => false],
        ['label' => 'Login', 'url' => Route::has('login') ? route('login', absolute: false) : null, 'kind' => 'internal', 'section' => 'Core', 'requiresAuth' => false],
        ['label' => 'Register', 'url' => Route::has('register') ? route('register', absolute: false) : null, 'kind' => 'internal', 'section' => 'Core', 'requiresAuth' => false],
        ['label' => 'Dashboard', 'url' => route('dashboard', absolute: false), 'kind' => 'internal', 'section' => 'Core', 'requiresAuth' => true],
        ['label' => 'Profile', 'url' => route('profile.edit', absolute: false), 'kind' => 'internal', 'section' => 'Core', 'requiresAuth' => true],
        ['label' => 'API Health', 'url' => route('api.v1.health', absolute: false), 'kind' => 'external', 'section' => 'Ops', 'requiresAuth' => false],
        ['label' => 'API User', 'url' => route('api.v1.user', absolute: false), 'kind' => 'external', 'section' => 'Data', 'requiresAuth' => true],
        ['label' => 'OpenAPI UI', 'url' => $openApiUrl, 'kind' => 'external', 'section' => 'Docs', 'requiresAuth' => false],
        ['label' => 'OpenAPI JSON', 'url' => $openApiDocsUrl, 'kind' => 'external', 'section' => 'Docs', 'requiresAuth' => false],
    ];

    $servicesHealthyCount = count(array_filter($services, static fn (array $service): bool => $service['ok']));
    $modulesHealthyCount = count(array_filter($modules, static fn (array $module): bool => $module['ok']));
    $availablePagesCount = count(array_filter($pages, static fn (array $page): bool => filled($page['url'])));

    return Inertia::render('Welcome', [
        'canLogin' => Route::has('login'),
        'canRegister' => Route::has('register'),
        'laravelVersion' => Application::VERSION,
        'phpVersion' => PHP_VERSION,
        'stackOverview' => [
            'generatedAt' => now()->toIso8601String(),
            'services' => $services,
            'modules' => $modules,
            'pages' => $pages,
            'stats' => [
                'servicesHealthy' => $servicesHealthyCount,
                'servicesTotal' => count($services),
                'modulesHealthy' => $modulesHealthyCount,
                'modulesTotal' => count($modules),
                'pagesAvailable' => $availablePagesCount,
                'pagesTotal' => count($pages),
            ],
        ],
    ]);
});

Route::get('/dashboard', function () {
    return Inertia::render('Dashboard');
})->middleware(['auth', 'verified'])->name('dashboard');

Route::middleware('auth')->group(function () {
    Route::get('/profile', [ProfileController::class, 'edit'])->name('profile.edit');
    Route::patch('/profile', [ProfileController::class, 'update'])->name('profile.update');
    Route::delete('/profile', [ProfileController::class, 'destroy'])->name('profile.destroy');
});

require __DIR__.'/auth.php';

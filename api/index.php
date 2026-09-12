<?php
/**
 * ALYN SHIR - Unified PHP API Front Controller / Router
 * Supports running via PHP's built-in CLI server:
 * php -S localhost:8000 api/index.php
 * or via Apache/Nginx web server.
 */

$uri = parse_url($_SERVER['REQUEST_URI'], PHP_URL_PATH);

// Normalize URI (strip leading /api or /)
$path = trim($uri, '/');
if (strpos($path, 'api/') === 0) {
    $path = substr($path, 4);
}

// Route table
$routes = [
    ''          => 'packages.php',
    'health'    => null,
    'packages'  => 'packages.php',
    'bookings'  => 'bookings.php',
    'auth'      => 'auth.php',
    'fleet'     => 'fleet.php',
    'guides'    => 'guides.php',
    'hotels'    => 'hotels.php',
    'audit'     => 'audit.php',
    'weather'   => 'weather.php',
    'concierge' => 'concierge.php',
    'settings'  => 'settings.php',
];

if ($path === 'health') {
    require_once __DIR__ . '/config/db.php';
    jsonResponse([
        'status' => 'ok',
        'backend' => 'ALYN SHIR PHP 8.x + MySQL PDO Engine',
        'timestamp' => date('Y-m-d H:i:s'),
    ]);
    exit();
}

$matched = $routes[$path] ?? null;

if (!$matched) {
    // Check if directly requesting a file like `packages.php`
    if (file_exists(__DIR__ . '/' . $path)) {
        require_once __DIR__ . '/' . $path;
        exit();
    }
    
    // Check if filename without .php exists
    if (file_exists(__DIR__ . '/' . $path . '.php')) {
        require_once __DIR__ . '/' . $path . '.php';
        exit();
    }

    require_once __DIR__ . '/config/db.php';
    jsonResponse([
        'error' => 'Endpoint not found',
        'requested' => $uri,
        'availableEndpoints' => array_keys($routes)
    ], 404);
    exit();
}

require_once __DIR__ . '/' . $matched;
?>

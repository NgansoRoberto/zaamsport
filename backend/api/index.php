<?php
error_reporting(E_ALL);
ini_set('display_errors', 1);
ini_set('log_errors', 1);
ini_set('error_log', __DIR__ . '/php_errors.log');

header("Content-Type: application/json");
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization");

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

function json_error($message, $code = 500) {
    http_response_code($code);
    echo json_encode(['error' => $message]);
    exit;
}

register_shutdown_function(function() {
    $error = error_get_last();
    if ($error && in_array($error['type'], [E_ERROR, E_PARSE, E_CORE_ERROR, E_COMPILE_ERROR])) {
        json_error('Erreur interne du serveur', 500);
    }
});

set_exception_handler(function($e) {
    json_error($e->getMessage(), 500);
});

// 1. Inclusions des fichiers - Vérifiez bien que votre dossier Windows s'appelle "controllers" avec un "r"
require_once __DIR__ . '/config/database.php';
require_once __DIR__ . '/contollers/Authcontroller.php';
require_once __DIR__ . '/contollers/clubscontroler.php';
require_once __DIR__ . '/contollers/managercontroler.php';
require_once __DIR__ . '/contollers/admincontroler.php';
require_once __DIR__ . '/contollers/Reviewcontroller.php';
require_once __DIR__ . '/contollers/Profilecontroller.php';

// 2. Traitement et nettoyage de la route
$request_uri = $_SERVER['REQUEST_URI'];
$path = parse_url($request_uri, PHP_URL_PATH);
$base = '/lamfunsport/api';

// On extrait la route après "/lamfunsport/api"
if (strpos($path, $base) === 0) {
    $path = substr($path, strlen($base));
}

// Sécurité : Si le path est vide, on force un slash
if ($path === '') {
    $path = '/';
}

// Optionnel mais recommandé : On retire le slash à la fin s'il y en a un (sauf si c'est la racine '/')
// Exemple : "/login/" devient "/login"
if ($path !== '/' && substr($path, -1) === '/') {
    $path = rtrim($path, '/');
}

$method = $_SERVER['REQUEST_METHOD'];

// 3. Système de routage (Mise en correspondance)
if ($path === '/register' && $method === 'POST') {
    (new AuthController($pdo))->register();
} elseif ($path === '/login' && $method === 'POST') {
    (new AuthController($pdo))->login();
} elseif ($path === '/clubs' && $method === 'GET') {
    (new ClubController($pdo))->getNearbyClubs();
} elseif ($path === '/manager/centers' && $method === 'GET') {
    (new managercontroler($pdo))->getCenters();
} elseif ($path === '/manager/centers' && $method === 'POST') {
    (new managercontroler($pdo))->createCenter();
} elseif (preg_match('/^\/manager\/centers\/(\d+)$/', $path, $matches) && $method === 'PUT') {
    (new managercontroler($pdo))->updateCenter($matches[1]);
} elseif (preg_match('/^\/manager\/centers\/(\d+)$/', $path, $matches) && $method === 'DELETE') {
    (new managercontroler($pdo))->deleteCenter($matches[1]);
} elseif ($path === '/admin/users' && $method === 'GET') {
    (new AdminController($pdo))->getUsers();
} elseif ($path === '/admin/centers' && $method === 'GET') {
    (new AdminController($pdo))->getAllCenters();
} elseif (preg_match('/^\/admin\/centers\/(\d+)\/approve$/', $path, $matches) && $method === 'PUT') {
    (new AdminController($pdo))->approveCenter($matches[1]);
} elseif (preg_match('/^\/admin\/centers\/(\d+)\/reject$/', $path, $matches) && $method === 'PUT') {
    (new AdminController($pdo))->rejectCenter($matches[1]);
} elseif (preg_match('/^\/admin\/users\/(\d+)\/ban$/', $path, $matches) && $method === 'DELETE') {
    (new AdminController($pdo))->banUser($matches[1]);
} elseif ($path === '/reviews' && $method === 'GET') {
    (new ReviewController($pdo))->getReviews();
} elseif ($path === '/reviews' && $method === 'POST') {
    (new ReviewController($pdo))->addOrUpdateReview();
}elseif (preg_match('/^\/clubs\/(\d+)$/', $path, $matches) && $method === 'GET') {
    (new ClubController($pdo))->getClubById($matches[1]);
} elseif ($path === '/profile' && $method === 'POST') {
    (new ProfileController($pdo))->saveProfile();
} else {
    // Si l'erreur persiste, on renvoie la route détectée pour vous aider à débugger
    http_response_code(404);
    echo json_encode([
        'error' => 'Endpoint non trouvé',
        'debug_route_detectee' => $path,
        'debug_methode' => $method
    ]);
    exit;
}

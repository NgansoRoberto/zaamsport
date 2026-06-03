<?php
// config/database.php
// Lit la configuration depuis les variables d'environnement.
// - En prod (Render, Neon, Supabase) : variable DATABASE_URL au format
//     postgres://user:password@host:port/dbname[?sslmode=require]
// - En local : variables séparées DB_HOST / DB_PORT / DB_NAME / DB_USER / DB_PASSWORD
//   (avec des valeurs par défaut compatibles avec l'environnement de dev historique).

$pdo = null;

function build_dsn_from_url($url) {
    $p = parse_url($url);
    if (!$p || empty($p['host']) || empty($p['path'])) return null;
    $host = $p['host'];
    $port = $p['port'] ?? 5432;
    $db = ltrim($p['path'], '/');
    $user = $p['user'] ?? '';
    $pass = $p['pass'] ?? '';
    $sslmode = 'prefer';
    if (!empty($p['query'])) {
        parse_str($p['query'], $q);
        if (!empty($q['sslmode'])) $sslmode = $q['sslmode'];
    }
    return [
        'dsn' => "pgsql:host=$host;port=$port;dbname=$db;sslmode=$sslmode",
        'user' => $user,
        'password' => $pass,
    ];
}

try {
    $databaseUrl = getenv('DATABASE_URL');
    if ($databaseUrl) {
        $cfg = build_dsn_from_url($databaseUrl);
        if (!$cfg) throw new Exception('DATABASE_URL invalide');
        error_log('[DB] Connexion via DATABASE_URL → host=' . parse_url($databaseUrl, PHP_URL_HOST));
        $pdo = new PDO($cfg['dsn'], $cfg['user'], $cfg['password']);
    } else {
        $host = getenv('DB_HOST') ?: 'localhost';
        $port = getenv('DB_PORT') ?: '5432';
        $dbname = getenv('DB_NAME') ?: 'lamfunsport';
        $user = getenv('DB_USER') ?: 'postgres';
        $password = getenv('DB_PASSWORD') ?: 'kenko';
        error_log("[DB] Connexion via vars séparées → host=$host port=$port dbname=$dbname");
        $pdo = new PDO("pgsql:host=$host;port=$port;dbname=$dbname", $user, $password);
    }

    $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
    $pdo->setAttribute(PDO::ATTR_DEFAULT_FETCH_MODE, PDO::FETCH_ASSOC);
    error_log('[DB] Connexion établie avec succès');
} catch (Throwable $e) {
    error_log('[DB] ERREUR connexion : ' . $e->getMessage());
    http_response_code(500);
    echo json_encode([
        'error' => 'Erreur de connexion à la base de données',
        'debug' => (getenv('APP_DEBUG') === '1') ? $e->getMessage() : null,
    ]);
    exit;
}

<?php
require_once __DIR__ . '/../utils/jwthelper.php';

class AuthMiddleware {
    public static function authenticate() {
        $headers = getallheaders();
        $authHeader = $headers['Authorization'] ?? '';
        if (preg_match('/Bearer\s(\S+)/', $authHeader, $matches)) {
            $token = $matches[1];
            $decoded = JwtHelper::verify($token);
            if ($decoded) {
                return $decoded; // contient user_id, email, role
            }
        }
        http_response_code(401);
        echo json_encode(['error' => 'Non authentifié']);
        exit;
    }

    public static function requireRole($allowedRoles) {
        $user = self::authenticate();
        if (!in_array($user->role, $allowedRoles)) {
            http_response_code(403);
            echo json_encode(['error' => 'Accès interdit']);
            exit;
        }
        return $user;
    }
}
?>
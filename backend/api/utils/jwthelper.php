<?php
require_once __DIR__ . '/../vendor/autoload.php';
use Firebase\JWT\JWT;
use Firebase\JWT\Key;

class JwtHelper {
    private static $algo = 'HS256';

    private static function secret() {
        $s = getenv('JWT_SECRET');
        if (!$s) {
            // Fallback dev uniquement. En prod, JWT_SECRET DOIT être défini.
            $s = 'dev_only_change_me_in_production_please';
        }
        return $s;
    }

    public static function generate($userId, $email, $role) {
        $payload = [
            'iat' => time(),
            'exp' => time() + (60 * 60 * 24),
            'user_id' => $userId,
            'email' => $email,
            'role' => $role
        ];
        return JWT::encode($payload, self::secret(), self::$algo);
    }

    public static function verify($token) {
        try {
            return JWT::decode($token, new Key(self::secret(), self::$algo));
        } catch (Exception $e) {
            return null;
        }
    }
}

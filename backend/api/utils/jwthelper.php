<?php
require_once __DIR__ . '/../vendor/autoload.php';
use Firebase\JWT\JWT;
use Firebase\JWT\Key;

class JwtHelper {
    private static $secret = 'votre_cle_secrete_tres_longue_et_aleatoire_123456789'; // changez cette clé
    private static $algo = 'HS256';

    public static function generate($userId, $email, $role) {
        $payload = [
            'iat' => time(),
            'exp' => time() + (60 * 60 * 24), // 24 heures
            'user_id' => $userId,
            'email' => $email,
            'role' => $role
        ];
        return JWT::encode($payload, self::$secret, self::$algo);
    }

    public static function verify($token) {
        try {
            return JWT::decode($token, new Key(self::$secret, self::$algo));
        } catch (Exception $e) {
            return null;
        }
    }
}
?>
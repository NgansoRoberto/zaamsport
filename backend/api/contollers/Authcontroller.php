<?php
// api/controllers/AuthController.php
require_once __DIR__ . '/../models/utilisateur.php';
require_once __DIR__ . '/../utils/jwthelper.php';

class AuthController {
    private $pdo;
    public function __construct($pdo) { $this->pdo = $pdo; }

    public function register() {
        $data = json_decode(file_get_contents('php://input'), true);
        $email = trim($data['email'] ?? '');
        $password = $data['password'] ?? '';
        $nom = trim($data['nom'] ?? '');
        $prenom = trim($data['prenom'] ?? '');

        // Sécurité : on n'accepte plus que les rôles "user" et "manager" via l'inscription publique.
        // Les comptes admin doivent être promus manuellement en BD ou via un endpoint admin protégé.
        $requestedRole = $data['role'] ?? 'user';
        $allowedRoles = ['user', 'manager'];
        $role = in_array($requestedRole, $allowedRoles, true) ? $requestedRole : 'user';

        if (!$email || !$password) {
            http_response_code(400);
            echo json_encode(['error' => 'Email et mot de passe requis']);
            return;
        }

        if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
            http_response_code(400);
            echo json_encode(['error' => 'Email invalide']);
            return;
        }

        if (strlen($password) < 8) {
            http_response_code(400);
            echo json_encode(['error' => 'Le mot de passe doit faire au moins 8 caractères']);
            return;
        }

        $userModel = new User($this->pdo);
        if ($userModel->findByEmail($email)) {
            http_response_code(409);
            echo json_encode(['error' => 'Email déjà utilisé']);
            return;
        }

        $hash = password_hash($password, PASSWORD_DEFAULT);
        $userId = $userModel->create($nom, $prenom, $email, $hash, $role);
        $token = JwtHelper::generate($userId, $email, $role);
        echo json_encode(['token' => $token, 'role' => $role, 'userId' => $userId]);
    }

    public function login() {
        $data = json_decode(file_get_contents('php://input'), true);
        $email = trim($data['email'] ?? '');
        $password = $data['password'] ?? '';

        $userModel = new User($this->pdo);
        $user = $userModel->findByEmail($email);

        // Réponse uniforme en cas d'échec (ne révèle pas si l'email existe et ne leak rien).
        if (!$user || !password_verify($password, $user['password_hash'])) {
            http_response_code(401);
            echo json_encode(['error' => 'Identifiants incorrects']);
            return;
        }

        $token = JwtHelper::generate($user['id'], $user['email'], $user['role']);
        echo json_encode([
            'token' => $token,
            'role' => $user['role'],
            'userId' => $user['id'],
            'managerId' => ($user['role'] === 'manager') ? $user['id'] : null
        ]);
    }
}

<?php
// api/controllers/AuthController.php
require_once __DIR__ . '/../models/utilisateur.php';
require_once __DIR__ . '/../utils/jwthelper.php';

class AuthController {
    private $pdo;
    public function __construct($pdo) { $this->pdo = $pdo; }

    public function register() {
        $data = json_decode(file_get_contents('php://input'), true);
        $email = $data['email'] ?? '';
        $password = $data['password'] ?? '';
        $role = $data['role'] ?? 'user';
        $nom = $data['nom'] ?? '';
        $prenom = $data['prenom'] ?? '';

        if (!$email || !$password) {
            http_response_code(400);
            echo json_encode(['error' => 'Email et mot de passe requis']);
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
    
    // Si le Front-end envoie de mauvaises clés (ex: username au lieu d'email)
    $email = $data['email'] ?? '';
    $password = $data['password'] ?? '';

    $userModel = new User($this->pdo);
    $user = $userModel->findByEmail($email);

    //  ZONE DE TEST TEMPORAIRE 
    if (!$user) {
        http_response_code(401);
        echo json_encode([
            'error' => 'Identifiants incorrects',
            'debug_systeme' => 'Email non trouvé en base de données',
            'email_recu_par_php' => $email
        ]);
        return;
    }

    if (!password_verify($password, $user['password_hash'])) {
        http_response_code(401);
        echo json_encode([
            'error' => 'Identifiants incorrects',
            'debug_systeme' => 'Utilisateur trouvé, mais le mot de passe ne correspond pas au hash',
            'hash_actuel_en_bdd' => $user['password_hash'],
            'mot_de_passe_saisi' => $password
        ]);
        return;
    }
    //  FIN DE LA ZONE DE TEST 

    $token = JwtHelper::generate($user['id'], $user['email'], $user['role']);
    echo json_encode([
        'token' => $token,
        'role' => $user['role'],
        'userId' => $user['id'],
        'managerId' => ($user['role'] === 'manager') ? $user['id'] : null
    ]);
}
}
?>
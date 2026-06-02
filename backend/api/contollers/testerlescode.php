<?php
// api/controllers/ProfileController.php
require_once __DIR__ . '/../middleware/AuthMiddleware.php';

class ProfileController {
    private $pdo;
    public function __construct($pdo) { $this->pdo = $pdo; }

    public function saveProfile() {
        $user = AuthMiddleware::authenticate();
        if (!$user) {
            http_response_code(401);
            echo json_encode(['error' => 'Non authentifié']);
            return;
        }

        $data = json_decode(file_get_contents('php://input'), true);
        if (!$data) {
            http_response_code(400);
            echo json_encode(['error' => 'Données invalides']);
            return;
        }

        $userId = $user->user_id;
        $transport = $data['transport'] ?? null;
        $goal = $data['goal'] ?? null;
        $accessibility = json_encode($data['accessibility'] ?? []);
        $budget = $data['budget'] ?? null;
        $hours = $data['hours'] ?? null;
        $useGps = isset($data['use_gps']) ? (bool)$data['use_gps'] : true;

        // Vérifier si un profil existe déjà
        $stmt = $this->pdo->prepare("SELECT user_id FROM user_profiles WHERE user_id = ?");
        $stmt->execute([$userId]);
        if ($stmt->fetch()) {
            // Mise à jour
            $stmt = $this->pdo->prepare("
                UPDATE user_profiles 
                SET transport = ?, goal = ?, accessibility = ?, budget = ?, hours = ?, use_gps = ?, updated_at = NOW()
                WHERE user_id = ?
            ");
            $stmt->execute([$transport, $goal, $accessibility, $budget, $hours, $useGps, $userId]);
            echo json_encode(['message' => 'Profil mis à jour']);
        } else {
            // Insertion
            $stmt = $this->pdo->prepare("
                INSERT INTO user_profiles (user_id, transport, goal, accessibility, budget, hours, use_gps)
                VALUES (?, ?, ?, ?, ?, ?, ?)
            ");
            $stmt->execute([$userId, $transport, $goal, $accessibility, $budget, $hours, $useGps]);
            echo json_encode(['message' => 'Profil créé']);
        }
    }
}
?>
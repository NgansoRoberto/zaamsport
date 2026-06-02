<?php
// api/controllers/AdminController.php
require_once __DIR__ . '/../middleware/AuthMiddleware.php';

class AdminController {
    private $pdo;
    public function __construct($pdo) { $this->pdo = $pdo; }

    public function getUsers() {
        AuthMiddleware::requireRole(['admin']);
        $stmt = $this->pdo->query("SELECT id, email, nom, prenom, role, created_at FROM users ORDER BY created_at DESC");
        echo json_encode($stmt->fetchAll(PDO::FETCH_ASSOC));
    }

    public function getAllCenters() {
        AuthMiddleware::requireRole(['admin']);
        $stmt = $this->pdo->query("
            SELECT fc.*, u.nom as manager_nom, u.prenom as manager_prenom
            FROM fitness_centers fc
            LEFT JOIN users u ON fc.manager_id = u.id
            ORDER BY fc.created_at DESC
        ");
        $centers = $stmt->fetchAll(PDO::FETCH_ASSOC);
        foreach ($centers as &$c) {
            $c['equipment'] = json_decode($c['equipment'], true) ?? [];
            $c['hours'] = json_decode($c['hours'], true) ?? [];
            $c['prices'] = json_decode($c['prices'], true) ?? [];
            $c['images'] = json_decode($c['images'], true) ?? [];
        }
        echo json_encode($centers);
    }

    public function approveCenter($id) {
        AuthMiddleware::requireRole(['admin']);
        $stmt = $this->pdo->prepare("UPDATE fitness_centers SET status = 'approved', rejection_reason = NULL WHERE id = ?");
        $stmt->execute([$id]);
        echo json_encode(['message' => 'Centre approuvé']);
    }

    public function rejectCenter($id) {
        AuthMiddleware::requireRole(['admin']);
        $data = json_decode(file_get_contents('php://input'), true);
        $reason = $data['reason'] ?? 'Aucun motif';
        $stmt = $this->pdo->prepare("UPDATE fitness_centers SET status = 'rejected', rejection_reason = ? WHERE id = ?");
        $stmt->execute([$reason, $id]);
        echo json_encode(['message' => 'Centre rejeté']);
    }

    public function banUser($id) {
        AuthMiddleware::requireRole(['admin']);
        $user = AuthMiddleware::authenticate();
        if ($user->user_id == $id) {
            http_response_code(403);
            echo json_encode(['error' => 'Vous ne pouvez pas vous bannir vous-même']);
            return;
        }
        $stmt = $this->pdo->prepare("DELETE FROM users WHERE id = ?");
        $stmt->execute([$id]);
        echo json_encode(['message' => 'Utilisateur banni']);
    }
}
?>
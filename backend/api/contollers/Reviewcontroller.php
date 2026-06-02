<?php
// api/controllers/ReviewController.php
require_once __DIR__ . '/../middleware/authmiddleware.php';

class ReviewController {
    private $pdo;
    public function __construct($pdo) { $this->pdo = $pdo; }

    public function addOrUpdateReview() {
        $user = AuthMiddleware::authenticate();
        if (!$user) {
            http_response_code(401);
            echo json_encode(['error' => 'Authentification requise']);
            return;
        }

        $data = json_decode(file_get_contents('php://input'), true);
        $centerId = $data['center_id'] ?? null;
        $rating = $data['rating'] ?? null;
        $comment = trim($data['comment'] ?? '');

        if (!$centerId || !$rating || $rating < 1 || $rating > 5) {
            http_response_code(400);
            echo json_encode(['error' => 'Données invalides']);
            return;
        }

        $stmt = $this->pdo->prepare("SELECT id FROM reviews WHERE user_id = ? AND center_id = ?");
        $stmt->execute([$user->user_id, $centerId]);
        if ($stmt->fetch()) {
            $update = $this->pdo->prepare("UPDATE reviews SET rating = ?, comment = ?, created_at = NOW() WHERE user_id = ? AND center_id = ?");
            $update->execute([$rating, $comment, $user->user_id, $centerId]);
            $msg = 'Avis mis à jour';
        } else {
            $insert = $this->pdo->prepare("INSERT INTO reviews (user_id, center_id, rating, comment) VALUES (?, ?, ?, ?)");
            $insert->execute([$user->user_id, $centerId, $rating, $comment]);
            $msg = 'Avis ajouté';
        }

        $avg = $this->pdo->prepare("SELECT AVG(rating) FROM reviews WHERE center_id = ?");
        $avg->execute([$centerId]);
        $avgRating = round($avg->fetchColumn(), 1);
        $updateCenter = $this->pdo->prepare("UPDATE fitness_centers SET avg_rating = ? WHERE id = ?");
        $updateCenter->execute([$avgRating, $centerId]);

        echo json_encode(['message' => $msg, 'avg_rating' => $avgRating]);
    }

    public function getReviews() {
        $centerId = $_GET['center_id'] ?? null;
        if (!$centerId) {
            http_response_code(400);
            echo json_encode(['error' => 'center_id requis']);
            return;
        }
        $stmt = $this->pdo->prepare("
            SELECT r.*, u.nom, u.prenom 
            FROM reviews r 
            JOIN users u ON r.user_id = u.id 
            WHERE r.center_id = ? 
            ORDER BY r.created_at DESC
        ");
        $stmt->execute([$centerId]);
        echo json_encode($stmt->fetchAll(PDO::FETCH_ASSOC));
    }
}
?>
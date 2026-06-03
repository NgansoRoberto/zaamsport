<?php
// api/controllers/ProfileController.php
require_once __DIR__ . '/../middleware/authmiddleware.php';

class ProfileController {
    private $pdo;
    public function __construct($pdo) { $this->pdo = $pdo; }

    public function saveProfile() {
        // En-têtes CORS indispensables pour éviter le blocage du navigateur (ORB / CORS)
        // CORS désormais géré centralement dans index.php via la variable d'env CORS_ORIGIN
        header("Access-Control-Allow-Headers: Content-Type, Authorization");
        header("Access-Control-Allow-Methods: POST, OPTIONS");
        
        if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
            http_response_code(200);
            exit();
        }

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
        
        // Récupération des données géographiques envoyées par React
        $latitude  = $data['location']['lat'] ?? null;
        $longitude = $data['location']['lng'] ?? null;
        $address   = $data['location']['address'] ?? null;

        $transport     = $data['transport'] ?? null;
        $goal          = $data['goal'] ?? null;
        $budget        = $data['budget'] ?? null;
        $hours         = $data['hours'] ?? null;

        // --- ADAPTATION POSTGRESQL : Conversion du tableau JS [] en tableau TEXT[] PostgreSQL ---
        $accessibility = $data['accessibility'] ?? [];
        $pg_accessibility = '{' . implode(',', array_map(function($item) {
            return '"' . str_replace(['\\', '"'], ['\\\\', '\\"'], $item) . '"';
        }, $accessibility)) . '}';

        try {
            // Vérifier si un profil existe déjà
            $stmt = $this->pdo->prepare("SELECT user_id FROM user_profiles WHERE user_id = ?");
            $stmt->execute([$userId]);
            
            if ($stmt->fetch()) {
                // MISE À JOUR : Utilisation de ST_SetSRID et ST_MakePoint (Attention : Longitude d'abord, puis Latitude)
                $stmt = $this->pdo->prepare("
                    UPDATE user_profiles 
                    SET geom = ST_SetSRID(ST_MakePoint(?, ?), 4326), 
                        address = ?, 
                        transport = ?, 
                        goal = ?, 
                        accessibility = ?::text[], 
                        budget = ?, 
                        hours = ?, 
                        updated_at = NOW()
                    WHERE user_id = ?
                ");
                $stmt->execute([$longitude, $latitude, $address, $transport, $goal, $pg_accessibility, $budget, $hours, $userId]);
                
                echo json_encode(['message' => 'Profil mis à jour avec succès']);
            } else {
                // INSERTION : Création du point PostGIS
                $stmt = $this->pdo->prepare("
                    INSERT INTO user_profiles (user_id, geom, address, transport, goal, accessibility, budget, hours)
                    VALUES (?, ST_SetSRID(ST_MakePoint(?, ?), 4326), ?, ?, ?, ?::text[], ?, ?)
                ");
                $stmt->execute([$userId, $longitude, $latitude, $address, $transport, $goal, $pg_accessibility, $budget, $hours]);
                
                echo json_encode(['message' => 'Profil créé avec succès']);
            }
        } catch (PDOException $e) {
            http_response_code(500);
            echo json_encode(['error' => 'Erreur lors de la sauvegarde PostGIS : ' . $e->getMessage()]);
        }
    }
}
?>
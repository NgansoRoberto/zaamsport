<?php
// api/controllers/ClubController.php
class ClubController {
    private $pdo;
    
    public function __construct($pdo) { 
        $this->pdo = $pdo; 
    }

    // ========== Récupérer les clubs à proximité avec score de recommandation ==========
    public function getNearbyClubs() {
        header('Content-Type: application/json');

        $lat = isset($_GET['lat']) ? floatval($_GET['lat']) : null;
        $lng = isset($_GET['lng']) ? floatval($_GET['lng']) : null;
        $radius = isset($_GET['radius']) ? floatval($_GET['radius']) : 10;

        if (!$lat || !$lng) {
            http_response_code(400);
            echo json_encode(['error' => 'Paramètres lat et lng requis']);
            return;
        }

        // Calcul de la distance (formule de Haversine) et d’un score combiné (distance + note moyenne)
        // La note moyenne (avg_rating) peut être NULL, on la traite comme 0.
        $sql = "
            SELECT *, 
                (6371 * acos(
                    LEAST(1.0, GREATEST(-1.0, 
                        cos(radians(:lat)) * cos(radians(lat)) * cos(radians(lng) - radians(:lng)) 
                        + sin(radians(:lat)) * sin(radians(lat))
                    ))
                )) AS distance_km,
                (
                    (1 / ( (6371 * acos(...)) + 0.5 )) * 0.6 
                    + (COALESCE(avg_rating, 0) / 5) * 0.4
                ) AS score
            FROM fitness_centers
            WHERE status = 'approved'
              AND lat IS NOT NULL 
              AND lng IS NOT NULL
        ";

        // On ne peut pas réutiliser le calcul de distance dans le WHERE sans sous-requête.
        // Utilisation d'une sous-requête pour filtrer par rayon et trier par score.
        $fullQuery = "
            SELECT * FROM (
                SELECT 
                    id, name, address, lat, lng, type, pmr, avg_rating,
                    equipment, hours, prices, images,
                    (6371 * acos(
                        LEAST(1.0, GREATEST(-1.0, 
                            cos(radians(:lat)) * cos(radians(lat)) * cos(radians(lng) - radians(:lng)) 
                            + sin(radians(:lat)) * sin(radians(lat))
                        ))
                    )) AS distance_km,
                    (
                        (1 / ( (6371 * acos(
                            LEAST(1.0, GREATEST(-1.0, 
                                cos(radians(:lat)) * cos(radians(lat)) * cos(radians(lng) - radians(:lng)) 
                                + sin(radians(:lat)) * sin(radians(lat))
                            ))
                        )) + 0.5 )) * 0.6 
                        + (COALESCE(avg_rating, 0) / 5) * 0.4
                    ) AS score
                FROM fitness_centers
                WHERE status = 'approved'
                  AND lat IS NOT NULL 
                  AND lng IS NOT NULL
            ) AS sub
            WHERE distance_km <= :radius
            ORDER BY score DESC
        ";

        try {
            $stmt = $this->pdo->prepare($fullQuery);
            $stmt->bindValue(':lat', $lat);
            $stmt->bindValue(':lng', $lng);
            $stmt->bindValue(':radius', $radius);
            $stmt->execute();
            
            $centers = $stmt->fetchAll(PDO::FETCH_ASSOC);

            // Décodage des champs JSON
            foreach ($centers as &$c) {
                $c['equipment'] = json_decode($c['equipment'], true) ?? [];
                $c['hours'] = json_decode($c['hours'], true) ?? [];
                $c['prices'] = json_decode($c['prices'], true) ?? [];
                $c['images'] = json_decode($c['images'], true) ?? [];
                $c['lat'] = floatval($c['lat']);
                $c['lng'] = floatval($c['lng']);
                $c['distance_km'] = round(floatval($c['distance_km']), 2);
                $c['score'] = round(floatval($c['score']), 2);
            }

            echo json_encode($centers);

        } catch (PDOException $e) {
            http_response_code(500);
            echo json_encode([
                'error' => 'Erreur PostgreSQL',
                'message' => $e->getMessage(),
                'file' => $e->getFile(),
                'line' => $e->getLine()
            ]);
        }
    }

    // ========== Récupérer un seul club par son ID ==========
    public function getClubById($id) {
        $stmt = $this->pdo->prepare("
            SELECT id, name, address, lat, lng, type, pmr, avg_rating, equipment, hours, prices, images
            FROM fitness_centers WHERE id = ?
        ");
        $stmt->execute([$id]);
        $club = $stmt->fetch(PDO::FETCH_ASSOC);
        if ($club) {
            $club['equipment'] = json_decode($club['equipment'], true);
            $club['hours'] = json_decode($club['hours'], true);
            $club['prices'] = json_decode($club['prices'], true);
            $club['images'] = json_decode($club['images'], true);
            echo json_encode($club);
        } else {
            http_response_code(404);
            echo json_encode(['error' => 'Club non trouvé']);
        }
    }
}
?>
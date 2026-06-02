<?php
// api/controllers/ClubController.php

class ClubController {
    private $pdo;
    private $recommandationSeuil = 0.0; // Seuil à 0 pour que tout centre correspondant remonte

    public function __construct($pdo) {
        $this->pdo = $pdo;
    }

    public function getNearbyClubs() {
        header('Content-Type: application/json');

        $lat = isset($_GET['lat']) ? floatval($_GET['lat']) : null;
        $lng = isset($_GET['lng']) ? floatval($_GET['lng']) : null;
        $radius = isset($_GET['radius']) ? floatval($_GET['radius']) : 10;
        $userId = isset($_GET['user_id']) ? intval($_GET['user_id']) : null;

        if (!$lat || !$lng) {
            http_response_code(400);
            echo json_encode(['error' => 'Paramètres lat et lng requis']);
            return;
        }

        // Récupération du profil utilisateur si userId est fourni
        $profile = null;
        if ($userId) {
            $stmt = $this->pdo->prepare("SELECT * FROM user_profiles WHERE user_id = ?");
            $stmt->execute([$userId]);
            $profile = $stmt->fetch(PDO::FETCH_ASSOC);
            // accessibility est un ARRAY PostgreSQL, pas besoin de json_decode
            // S'il est au format JSON, on le décode ; sinon on le laisse tel quel
            if ($profile && !is_array($profile['accessibility'])) {
                $profile['accessibility'] = json_decode($profile['accessibility'], true);
            }
        }

        // Requête SQL pour calculer la distance (formule de Haversine)
        $sql = "
            SELECT 
                id, name, address, type, pmr, avg_rating,
                equipment, hours, prices, images,
                lat, lng,
                (6371 * acos(
                    LEAST(1.0, GREATEST(-1.0, 
                        cos(radians(:lat)) * cos(radians(lat)) * cos(radians(lng) - radians(:lng)) 
                        + sin(radians(:lat)) * sin(radians(lat))
                    ))
                )) AS distance_km
            FROM fitness_centers
            WHERE status = 'approved'
              AND lat IS NOT NULL 
              AND lng IS NOT NULL
        ";

        try {
            $stmt = $this->pdo->prepare($sql);
            $stmt->bindValue(':lat', $lat);
            $stmt->bindValue(':lng', $lng);
            $stmt->execute();
            $centers = $stmt->fetchAll(PDO::FETCH_ASSOC);

            $results = [];
            foreach ($centers as $center) {
                if ($center['distance_km'] <= $radius) {
                    if ($userId && $profile) {
                        // Mode recommandation : calcul du score personnalisé
                        $score = $this->calculateScore($center, $profile, $radius);
                        // On garde le centre si son score > 0 (ou >= seuil)
                        // Le seuil à 0 permet d'inclure tous les centres qui correspondent au minimum
                        if ($score > $this->recommandationSeuil) {
                            $center['recommendation_score'] = round($score, 3);
                            $results[] = $center;
                        }
                    } else {
                        // Mode normal : on garde tous les centres
                        $results[] = $center;
                    }
                }
            }

            // Tri : en mode recommandation par score décroissant, sinon par distance croissante
            if ($userId && $profile) {
                usort($results, function ($a, $b) {
                    return $b['recommendation_score'] <=> $a['recommendation_score'];
                });
            } else {
                usort($results, function ($a, $b) {
                    return $a['distance_km'] <=> $b['distance_km'];
                });
            }

            // Décodage des champs JSON
            foreach ($results as &$c) {
                $c['equipment'] = json_decode($c['equipment'], true) ?? [];
                $c['hours'] = json_decode($c['hours'], true) ?? [];
                $c['prices'] = json_decode($c['prices'], true) ?? [];
                $c['images'] = json_decode($c['images'], true) ?? [];
                $c['lat'] = floatval($c['lat']);
                $c['lng'] = floatval($c['lng']);
                $c['distance_km'] = round(floatval($c['distance_km']), 2);
            }

            echo json_encode(array_values($results));
        } catch (PDOException $e) {
            http_response_code(500);
            echo json_encode(['error' => 'Erreur PostgreSQL', 'message' => $e->getMessage()]);
        }
    }

    /**
     * Calcule un score de pertinence entre 0 et 1.
     */
    private function calculateScore($center, $profile, $radius) {
        $score = 0;
        $totalWeight = 0;

        // 1. Distance (poids 0.4)
        $distNorm = min(1, $center['distance_km'] / $radius);
        $distanceScore = (1 - $distNorm) * 0.4;
        $score += $distanceScore;
        $totalWeight += 0.4;

        // 2. Accessibilité (poids 0.3)
        $accessCriteria = $profile['accessibility'] ?? [];
        $accessScore = 0;
        if (count($accessCriteria) > 0) {
            $matched = 0;
            // Vérifier chaque critère
            if (in_array('Accès PMR(acces pour les personnes à mobilités reduite)', $accessCriteria) && $center['pmr']) $matched++;
            if (in_array('Ascenseur', $accessCriteria)) {
                $equipment = json_decode($center['equipment'], true);
                if (in_array('Ascenseur', $equipment)) $matched++;
            }
            if (in_array('Sanitaires adaptés', $accessCriteria)) {
                $equipment = json_decode($center['equipment'], true);
                if (in_array('Sanitaires adaptés', $equipment)) $matched++;
            }
            if (in_array('parking', $accessCriteria)) {
                $equipment = json_decode($center['equipment'], true);
                if (in_array('Parking', $equipment) || in_array('Parking handicapé', $equipment)) $matched++;
            }
            $accessScore = ($matched / count($accessCriteria)) * 0.3;
            $score += $accessScore;
            $totalWeight += 0.3;
        }

        // 3. Objectif (poids 0.15)
        $goal = $profile['goal'] ?? '';
        $centerType = $center['type'];
        $goalScore = 0;
        if ($goal == 'Prise de masse' && $centerType == 'Musculation') $goalScore = 0.15;
        elseif ($goal == 'Perte de poids' && in_array($centerType, ['Salle de sport', 'Piscine', 'CrossFit'])) $goalScore = 0.15;
        elseif ($goal == 'Remise en forme' && in_array($centerType, ['Salle de sport', 'Yoga', 'Piscine'])) $goalScore = 0.15;
        elseif ($goal == 'Rééducation' && in_array($centerType, ['Yoga', 'Piscine'])) $goalScore = 0.15;
        elseif ($goal == 'Autre') $goalScore = 0.05;
        $score += $goalScore;
        $totalWeight += 0.15;

        // 4. Budget (poids 0.1)
        $budget = $profile['budget'] ?? '';
        $monthlyPrice = 0;
        $prices = json_decode($center['prices'], true);
        if (isset($prices['monthly'])) {
            $monthlyPrice = intval(preg_replace('/[^0-9]/', '', $prices['monthly']));
        }
        $budgetScore = 0;
        if ($budget == 'Moins de 2000f' && $monthlyPrice < 2000) $budgetScore = 0.10;
        elseif ($budget == '2000-4000f' && $monthlyPrice >= 2000 && $monthlyPrice <= 4000) $budgetScore = 0.10;
        elseif ($budget == '4000fcfa-6000fcfa' && $monthlyPrice >= 4000 && $monthlyPrice <= 6000) $budgetScore = 0.10;
        elseif ($budget == 'Plus de 6000fcfa' && $monthlyPrice > 6000) $budgetScore = 0.10;
        $score += $budgetScore;
        $totalWeight += 0.10;

        // 5. Transport (poids 0.05) - à améliorer plus tard
        $transport = $profile['transport'] ?? '';
        $transportScore = 0;
        // Pour l'instant, on donne un bonus fixe si l'utilisateur a répondu
        if ($transport) $transportScore = 0.05;
        $score += $transportScore;
        $totalWeight += 0.05;

        // 6. Horaires (poids 0.05)
        $hoursPref = $profile['hours'] ?? '';
        $hoursScore = 0;
        $centerHours = json_decode($center['hours'], true);
        if ($hoursPref && $centerHours) {
            $prefStart = null;
            if ($hoursPref == 'Matin (6h-10h)') $prefStart = 6;
            elseif ($hoursPref == 'Midi (10h-14h)') $prefStart = 10;
            elseif ($hoursPref == 'Après-midi (14h-18h)') $prefStart = 14;
            elseif ($hoursPref == 'Soir (18h-22h)') $prefStart = 18;
            if ($prefStart) {
                $monday = $centerHours['monday'] ?? '';
                if (preg_match('/(\d+)\s*h/', $monday, $matches)) {
                    $openHour = intval($matches[1]);
                    if ($openHour <= $prefStart) $hoursScore = 0.05;
                } else {
                    $hoursScore = 0.02;
                }
            }
        }
        $score += $hoursScore;
        $totalWeight += 0.05;

        // Normalisation : ramener le score sur une base de 1 (si les poids totaux sont inférieurs à 1)
        if ($totalWeight < 1) {
            $score = $score / $totalWeight;
        }
        return $score;
    }

    public function getClubById($id) {
        // ... inchangé ...
    }
}
?>
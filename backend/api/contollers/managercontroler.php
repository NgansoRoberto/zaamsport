<?php
// api/controllers/ManagerController.php (extrait modifié)
require_once __DIR__ . '/../middleware/authmiddleware.php';

class managercontroler{
    private $pdo;
    public function __construct($pdo) { $this->pdo = $pdo; }

    public function getCenters() {
        $user = authmiddleware::requireRole(['manager']);
        $managerId = $user->user_id; 

        $stmt = $this->pdo->prepare("
            SELECT id, name, address, type, pmr, status, equipment, hours, prices, images,
                   lat, lng, created_at
            FROM fitness_centers
            WHERE manager_id = ?
            ORDER BY created_at DESC
        ");
        $stmt->execute([$managerId]);
        $centers = $stmt->fetchAll(PDO::FETCH_ASSOC);

        foreach ($centers as &$c) {
            $c['equipment'] = json_decode($c['equipment'], true) ?? [];
            $c['hours'] = json_decode($c['hours'], true) ?? [];
            $c['prices'] = json_decode($c['prices'], true) ?? [];
            $c['images'] = json_decode($c['images'], true) ?? [];
        }
        echo json_encode($centers);
    }

public function createCenter(){
    $user = authmiddleware::requireRole(['manager']);
    $managerId = $user->user_id;

    // Récupérer les champs texte du formulaire (multipart)
    $name = $_POST['name'] ?? '';
    $address = $_POST['address'] ?? '';
    $lat = $_POST['lat'] ?? '';
    $lng = $_POST['lng'] ?? '';
    $type = $_POST['type'] ?? '';
    $pmr = isset($_POST['pmr']) ? filter_var($_POST['pmr'], FILTER_VALIDATE_BOOLEAN) : false;
    $equipment = json_decode($_POST['equipment'] ?? '[]', true);
    $hours = json_decode($_POST['hours'] ?? '{}', true);
    $prices = json_decode($_POST['prices'] ?? '{}', true);

    // Validation
    if (empty($name) || empty($address) || empty($lat) || empty($lng)) {
        http_response_code(400);
        echo json_encode(['error' => 'Nom, adresse et coordonnées GPS requis']);
        return;
    }

    // Gestion des images uploadées
    $uploadedImages = [];
    if (isset($_FILES['images'])) {
        $uploadDir = __DIR__ . '/../../uploads/centers/';
        if (!is_dir($uploadDir)) mkdir($uploadDir, 0777, true);
        foreach ($_FILES['images']['tmp_name'] as $key => $tmpName) {
            if ($_FILES['images']['error'][$key] === UPLOAD_ERR_OK) {
                $filename = uniqid() . '_' . basename($_FILES['images']['name'][$key]);
                if (move_uploaded_file($tmpName, $uploadDir . $filename)) {
                    $uploadedImages[] = 'uploads/centers/' . $filename;
                }
            }
        }
    }


 

    $equipmentJson = json_encode($equipment);
    $hoursJson = json_encode($hours);
    $pricesJson = json_encode($prices);
    $imagesJson = json_encode($uploadedImages);

   $sql = "INSERT INTO fitness_centers 
        (manager_id, name, address, geom, lat, lng, type, pmr, equipment, hours, prices, images, status)
        VALUES (?, ?, ?, ST_SetSRID(ST_MakePoint(?, ?), 4326), ?, ?, ?, ?, ?, ?, ?, ?, 'pending')";
$stmt = $this->pdo->prepare($sql);
$stmt->execute([
    $managerId, $name, $address, $lng, $lat, $lat, $lng, $type,
    $pmr, $equipmentJson, $hoursJson, $pricesJson, $imagesJson
]);
/*
    $stmt = $this->pdo->prepare("
        INSERT INTO fitness_centers 
        (manager_id, name, address, lat, lng, type, pmr, equipment, hours, prices, images, status)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'pending')
    ");
    $stmt->execute([
        $managerId, $name, $address, $lat, $lng,
        $type, $pmr, $equipmentJson, $hoursJson, $pricesJson, $imagesJson
    ]);*/
    echo json_encode(['message' => 'Centre créé avec succès, en attente de validation']);
}


public function updateCenter($id) {
    $user = authmiddleware::requireRole(['manager']);
    $managerId = $user->user_id;

    // Vérifier que le centre appartient bien au manager
    $check = $this->pdo->prepare("SELECT id FROM fitness_centers WHERE id = ? AND manager_id = ?");
    $check->execute([$id, $managerId]);
    if (!$check->fetch()) {
        http_response_code(403);
        echo json_encode(['error' => 'Accès interdit']);
        return;
    }
    //supprimer un centre
    // Récupérer les champs POST
    $name = $_POST['name'] ?? '';
    $address = $_POST['address'] ?? '';
    $lat = $_POST['lat'] ?? '';
    $lng = $_POST['lng'] ?? '';
    $type = $_POST['type'] ?? '';
    $pmr = isset($_POST['pmr']) ? filter_var($_POST['pmr'], FILTER_VALIDATE_BOOLEAN) : false;
    $equipment = json_decode($_POST['equipment'] ?? '[]', true);
    $hours = json_decode($_POST['hours'] ?? '{}', true);
    $prices = json_decode($_POST['prices'] ?? '{}', true);

    // Gestion des images : on conserve les anciennes + on ajoute les nouvelles
    // Récupérer les images existantes (pour ne pas les perdre)
    $stmt = $this->pdo->prepare("SELECT images FROM fitness_centers WHERE id = ?");
    $stmt->execute([$id]);
    $oldImages = json_decode($stmt->fetchColumn(), true) ?? [];

    $uploadedImages = $oldImages; // on garde les anciennes
    if (isset($_FILES['images'])) {
        $uploadDir = __DIR__ . '/../../uploads/centers/';
        if (!is_dir($uploadDir)) mkdir($uploadDir, 0777, true);
        foreach ($_FILES['images']['tmp_name'] as $key => $tmpName) {
            if ($_FILES['images']['error'][$key] === UPLOAD_ERR_OK) {
                $filename = uniqid() . '_' . basename($_FILES['images']['name'][$key]);
                if (move_uploaded_file($tmpName, $uploadDir . $filename)) {
                    $uploadedImages[] = 'uploads/centers/' . $filename;
                }
            }
        }
    }
    

    $equipmentJson = json_encode($equipment);
    $hoursJson = json_encode($hours);
    $pricesJson = json_encode($prices);
    $imagesJson = json_encode($uploadedImages);

    $stmt = $this->pdo->prepare("
        UPDATE fitness_centers 
        SET name = ?, address = ?, lat = ?, lng = ?, type = ?, pmr = ?, 
            equipment = ?, hours = ?, prices = ?, images = ?
        WHERE id = ? AND manager_id = ?
    ");
    $stmt->execute([
        $name, $address, $lat, $lng, $type, $pmr,
        $equipmentJson, $hoursJson, $pricesJson, $imagesJson,
        $id, $managerId
    ]);
    echo json_encode(['message' => 'Centre mis à jour']);
}
public function deleteCenter($id) {
        $user = authmiddleware::requireRole(['manager']);
        $managerId = $user->user_id;
        $stmt = $this->pdo->prepare("DELETE FROM fitness_centers WHERE id = ? AND manager_id = ?");
        $stmt->execute([$id, $managerId]);
        if ($stmt->rowCount() > 0) {
            echo json_encode(['message' => 'Centre supprimé']);
        } else {
            http_response_code(404);
            echo json_encode(['error' => 'Centre non trouvé']);
        }
    }

}

?>
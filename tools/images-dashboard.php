<?php
// Chargement du .env depuis backend/api/
$envFile = __DIR__ . '/../backend/api/.env';
if (is_file($envFile)) {
    foreach (file($envFile, FILE_IGNORE_NEW_LINES | FILE_SKIP_EMPTY_LINES) as $line) {
        if ($line[0] === '#' || strpos($line, '=') === false) continue;
        [$key, $val] = explode('=', $line, 2);
        $key = trim($key); $val = trim($val);
        if ($key !== '' && getenv($key) === false) { putenv("$key=$val"); $_ENV[$key] = $val; }
    }
}

// Connexion DB
function connectDb() {
    $url = getenv('DATABASE_URL');
    if (!$url) die('<p class="error">DATABASE_URL manquant dans .env</p>');
    $p = parse_url($url);
    $dsn = "pgsql:host={$p['host']};port=" . ($p['port'] ?? 5432) . ";dbname=" . ltrim($p['path'], '/') . ";sslmode=require";
    $pdo = new PDO($dsn, $p['user'], $p['pass']);
    $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
    return $pdo;
}

// Compression GD (max 8 MB / 1920px)
function compressImage(string $src): string {
    $limit = 8 * 1024 * 1024;
    $maxDim = 1920;
    if (!function_exists('imagecreatefromjpeg') || filesize($src) <= $limit) return $src;
    $mime = mime_content_type($src) ?: '';
    $im = match(true) {
        str_contains($mime, 'jpeg'), str_contains($mime, 'jpg') => @imagecreatefromjpeg($src),
        str_contains($mime, 'png')  => @imagecreatefrompng($src),
        str_contains($mime, 'webp') => function_exists('imagecreatefromwebp') ? @imagecreatefromwebp($src) : null,
        default => null,
    };
    if (!$im) return $src;
    $w = imagesx($im); $h = imagesy($im);
    if ($w > $maxDim || $h > $maxDim) {
        $r = min($maxDim/$w, $maxDim/$h);
        $dst = imagecreatetruecolor((int)($w*$r), (int)($h*$r));
        imagealphablending($dst, false); imagesavealpha($dst, true);
        imagecopyresampled($dst, $im, 0, 0, 0, 0, (int)($w*$r), (int)($h*$r), $w, $h);
        imagedestroy($im); $im = $dst;
    }
    $tmp = tempnam(sys_get_temp_dir(), 'zs_') . '.jpg';
    imagejpeg($im, $tmp, 82);
    imagedestroy($im);
    return $tmp;
}

// Upload vers Cloudinary (avec compression)
function uploadToCloudinary($tmpPath, $originalName) {
    $cloudName = getenv('CLOUDINARY_CLOUD_NAME');
    $apiKey    = getenv('CLOUDINARY_API_KEY');
    $apiSecret = getenv('CLOUDINARY_API_SECRET');

    $pathToUpload = compressImage($tmpPath);
    $isTmp = ($pathToUpload !== $tmpPath);

    $timestamp = time();
    $folder    = 'zaamsport/centers';
    $publicId  = uniqid();
    $signature = sha1("folder={$folder}&public_id={$publicId}&timestamp={$timestamp}" . $apiSecret);

    $ch = curl_init("https://api.cloudinary.com/v1_1/{$cloudName}/image/upload");
    curl_setopt_array($ch, [
        CURLOPT_RETURNTRANSFER => true,
        CURLOPT_POST           => true,
        CURLOPT_POSTFIELDS     => [
            'file'      => new CURLFile($pathToUpload, 'image/jpeg', $originalName),
            'api_key'   => $apiKey,
            'timestamp' => $timestamp,
            'folder'    => $folder,
            'public_id' => $publicId,
            'signature' => $signature,
        ],
        CURLOPT_TIMEOUT => 60,
    ]);
    $res  = curl_exec($ch);
    $code = curl_getinfo($ch, CURLINFO_HTTP_CODE);
    curl_close($ch);
    if ($isTmp) @unlink($pathToUpload);
    if ($code !== 200) return ['error' => 'Upload échoué (HTTP ' . $code . '): ' . $res];
    $data = json_decode($res, true);
    return isset($data['secure_url']) ? ['url' => $data['secure_url']] : ['error' => 'Réponse inattendue: ' . $res];
}

// Renomme un asset sur Cloudinary (pour corriger les URLs dupliquées)
function cloudinaryRename(string $fromPublicId, string $toPublicId): array {
    $cloudName = getenv('CLOUDINARY_CLOUD_NAME');
    $apiKey    = getenv('CLOUDINARY_API_KEY');
    $apiSecret = getenv('CLOUDINARY_API_SECRET');
    $timestamp = time();
    $signature = sha1("from_public_id={$fromPublicId}&timestamp={$timestamp}&to_public_id={$toPublicId}" . $apiSecret);
    $ch = curl_init("https://api.cloudinary.com/v1_1/{$cloudName}/image/rename");
    curl_setopt_array($ch, [
        CURLOPT_RETURNTRANSFER => true,
        CURLOPT_POST           => true,
        CURLOPT_POSTFIELDS     => [
            'from_public_id' => $fromPublicId,
            'to_public_id'   => $toPublicId,
            'api_key'        => $apiKey,
            'timestamp'      => $timestamp,
            'signature'      => $signature,
        ],
        CURLOPT_TIMEOUT => 30,
    ]);
    $res  = curl_exec($ch);
    $code = curl_getinfo($ch, CURLINFO_HTTP_CODE);
    curl_close($ch);
    $data = json_decode($res, true);
    return ($code === 200 && !empty($data['secure_url']))
        ? ['url' => $data['secure_url']]
        : ['error' => 'Rename échoué (HTTP ' . $code . '): ' . $res];
}

// Extrait le public_id depuis une URL Cloudinary
function extractPublicId(string $url): string {
    // ex: .../image/upload/v123/zaamsport/centers/zaamsport/centers/abc.jpg → zaamsport/centers/zaamsport/centers/abc
    if (preg_match('!/image/upload/(?:v\d+/)?(.+?)(?:\.\w+)?$!', $url, $m)) return $m[1];
    return '';
}

$pdo = connectDb();
$message = null;
$messageType = 'success';

// --- Actions POST ---
if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $action = $_POST['action'] ?? '';

    // Corriger une URL dupliquée (zaamsport/centers/zaamsport/centers/... → zaamsport/centers/...)
    if ($action === 'fix_duplicate_url') {
        $centerId = intval($_POST['center_id']);
        $index    = intval($_POST['img_index']);
        $oldUrl   = trim($_POST['old_url']);
        $fromId   = extractPublicId($oldUrl);
        // Corriger le public_id : zaamsport/centers/zaamsport/centers/X → zaamsport/centers/X
        $toId = preg_replace('!^(zaamsport/centers/)zaamsport/centers/!', '$1', $fromId);
        if ($fromId === $toId) {
            $message = "URL déjà correcte, pas de doublon détecté."; $messageType = 'error';
        } else {
            $result = cloudinaryRename($fromId, $toId);
            if (isset($result['error'])) {
                $message = $result['error']; $messageType = 'error';
            } else {
                $stmt = $pdo->prepare("SELECT images FROM fitness_centers WHERE id = ?");
                $stmt->execute([$centerId]);
                $images = json_decode($stmt->fetchColumn(), true) ?? [];
                $images[$index] = $result['url'];
                $pdo->prepare("UPDATE fitness_centers SET images = ? WHERE id = ?")->execute([json_encode($images), $centerId]);
                $message = "URL corrigée : " . $result['url'];
            }
        }
    }

    // Mettre à jour l'URL d'une image manuellement
    if ($action === 'update_url') {
        $centerId = intval($_POST['center_id']);
        $index    = intval($_POST['img_index']);
        $newUrl   = trim($_POST['new_url']);
        $stmt     = $pdo->prepare("SELECT images FROM fitness_centers WHERE id = ?");
        $stmt->execute([$centerId]);
        $images = json_decode($stmt->fetchColumn(), true) ?? [];
        if (isset($images[$index])) {
            $images[$index] = $newUrl;
            $pdo->prepare("UPDATE fitness_centers SET images = ? WHERE id = ?")->execute([json_encode($images), $centerId]);
            $message = "Image mise à jour pour le centre #$centerId.";
        } else {
            $message = "Index invalide."; $messageType = 'error';
        }
    }

    // Supprimer une image
    if ($action === 'delete_image') {
        $centerId = intval($_POST['center_id']);
        $index    = intval($_POST['img_index']);
        $stmt     = $pdo->prepare("SELECT images FROM fitness_centers WHERE id = ?");
        $stmt->execute([$centerId]);
        $images = json_decode($stmt->fetchColumn(), true) ?? [];
        array_splice($images, $index, 1);
        $pdo->prepare("UPDATE fitness_centers SET images = ? WHERE id = ?")->execute([json_encode($images), $centerId]);
        $message = "Image supprimée du centre #$centerId.";
    }

    // Uploader un fichier local vers Cloudinary et enregistrer l'URL
    if ($action === 'upload_file') {
        $centerId = intval($_POST['center_id']);
        if (isset($_FILES['image_file']) && $_FILES['image_file']['error'] === UPLOAD_ERR_OK) {
            $result = uploadToCloudinary($_FILES['image_file']['tmp_name'], $_FILES['image_file']['name']);
            if (isset($result['error'])) {
                $message = 'Erreur Cloudinary : ' . $result['error']; $messageType = 'error';
            } else {
                $stmt = $pdo->prepare("SELECT images FROM fitness_centers WHERE id = ?");
                $stmt->execute([$centerId]);
                $images = json_decode($stmt->fetchColumn(), true) ?? [];
                $images[] = $result['url'];
                $pdo->prepare("UPDATE fitness_centers SET images = ? WHERE id = ?")->execute([json_encode($images), $centerId]);
                $message = "Image uploadée et enregistrée : " . $result['url'];
            }
        } else {
            $message = "Aucun fichier reçu."; $messageType = 'error';
        }
    }

    // Migrer automatiquement une image locale vers Cloudinary
    if ($action === 'migrate_local') {
        $centerId  = intval($_POST['center_id']);
        $index     = intval($_POST['img_index']);
        $localPath = $_POST['local_path'];
        $fullPath  = __DIR__ . '/../backend/' . ltrim($localPath, '/');
        if (!file_exists($fullPath)) {
            $message = "Fichier introuvable : $fullPath"; $messageType = 'error';
        } else {
            $result = uploadToCloudinary($fullPath, basename($fullPath));
            if (isset($result['error'])) {
                $message = 'Erreur Cloudinary : ' . $result['error']; $messageType = 'error';
            } else {
                $stmt = $pdo->prepare("SELECT images FROM fitness_centers WHERE id = ?");
                $stmt->execute([$centerId]);
                $images = json_decode($stmt->fetchColumn(), true) ?? [];
                $images[$index] = $result['url'];
                $pdo->prepare("UPDATE fitness_centers SET images = ? WHERE id = ?")->execute([json_encode($images), $centerId]);
                $message = "Migré vers Cloudinary : " . $result['url'];
            }
        }
    }

    header('Location: ' . $_SERVER['PHP_SELF'] . ($message ? '?msg=' . urlencode($message) . '&type=' . $messageType : ''));
    exit;
}

if (isset($_GET['msg'])) { $message = $_GET['msg']; $messageType = $_GET['type'] ?? 'success'; }

// Charger tous les centres
$centers = $pdo->query("SELECT id, name, status, images FROM fitness_centers ORDER BY id")->fetchAll(PDO::FETCH_ASSOC);

// Inventaire des fichiers locaux
$uploadsDir  = __DIR__ . '/../backend/uploads/centers/';
$localFiles  = is_dir($uploadsDir) ? array_values(array_filter(scandir($uploadsDir), fn($f) => $f !== '.' && $f !== '..' && $f !== '.gitkeep')) : [];

// Quels fichiers locaux sont référencés dans la DB ?
$referencedLocal = [];
foreach ($centers as $c) {
    $imgs = json_decode($c['images'], true) ?? [];
    foreach ($imgs as $img) {
        if (!str_starts_with($img, 'http')) $referencedLocal[$img] = $c['name'];
    }
}
$orphanFiles = array_filter($localFiles, fn($f) => !isset($referencedLocal['uploads/centers/' . $f]));
?>
<!DOCTYPE html>
<html lang="fr">
<head>
<meta charset="UTF-8">
<title>Dashboard Images — ZaamSport</title>
<style>
  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
  body { font-family: system-ui, sans-serif; background: #0f172a; color: #e2e8f0; min-height: 100vh; }
  .header { background: #1e293b; border-bottom: 1px solid #334155; padding: 16px 32px; display: flex; align-items: center; gap: 12px; }
  .header h1 { font-size: 18px; font-weight: 700; color: #f1f5f9; }
  .badge { font-size: 11px; background: #0ea5e9; color: #fff; padding: 2px 8px; border-radius: 99px; }
  .container { max-width: 1100px; margin: 0 auto; padding: 32px 24px; }
  .alert { padding: 12px 16px; border-radius: 8px; margin-bottom: 24px; font-size: 14px; }
  .alert.success { background: #052e16; color: #4ade80; border: 1px solid #166534; }
  .alert.error   { background: #450a0a; color: #f87171; border: 1px solid #991b1b; }
  h2 { font-size: 15px; font-weight: 600; color: #94a3b8; text-transform: uppercase; letter-spacing: .06em; margin-bottom: 16px; }
  .section { margin-bottom: 40px; }
  .center-card { background: #1e293b; border: 1px solid #334155; border-radius: 12px; margin-bottom: 16px; overflow: hidden; }
  .center-header { padding: 14px 20px; display: flex; align-items: center; gap: 12px; border-bottom: 1px solid #334155; }
  .center-id { font-size: 12px; color: #64748b; }
  .center-name { font-weight: 600; font-size: 15px; }
  .status { font-size: 11px; padding: 2px 8px; border-radius: 99px; }
  .status.approved { background: #052e16; color: #4ade80; }
  .status.pending  { background: #451a03; color: #fb923c; }
  .status.rejected { background: #450a0a; color: #f87171; }
  .center-body { padding: 16px 20px; }
  .images-grid { display: flex; flex-wrap: wrap; gap: 12px; margin-bottom: 16px; }
  .img-slot { background: #0f172a; border: 1px solid #334155; border-radius: 8px; width: 160px; overflow: hidden; }
  .img-slot.local { border-color: #b45309; }
  .img-slot.cloud { border-color: #0369a1; }
  .img-slot.duplicate { border-color: #7c3aed; }
  .img-preview { width: 100%; height: 100px; object-fit: cover; display: block; }
  .img-preview-placeholder { width: 100%; height: 100px; display: flex; align-items: center; justify-content: center; font-size: 28px; background: #1e293b; }
  .img-meta { padding: 8px; }
  .img-type { font-size: 10px; font-weight: 700; text-transform: uppercase; margin-bottom: 4px; }
  .img-type.local { color: #f59e0b; }
  .img-type.cloud { color: #38bdf8; }
  .img-path { font-size: 10px; color: #64748b; word-break: break-all; margin-bottom: 6px; }
  .img-actions { display: flex; flex-direction: column; gap: 4px; }
  .btn { display: inline-block; padding: 5px 10px; border-radius: 6px; font-size: 12px; font-weight: 500; border: none; cursor: pointer; text-align: center; }
  .btn-migrate { background: #92400e; color: #fde68a; width: 100%; }
  .btn-migrate:hover { background: #b45309; }
  .btn-delete  { background: #450a0a; color: #fca5a5; width: 100%; }
  .btn-delete:hover  { background: #7f1d1d; }
  .btn-primary { background: #0369a1; color: #fff; }
  .btn-primary:hover { background: #0284c7; }
  .url-form { display: flex; flex-direction: column; gap: 4px; }
  .url-input { background: #0f172a; border: 1px solid #334155; color: #e2e8f0; padding: 5px 8px; border-radius: 6px; font-size: 11px; width: 100%; }
  .url-input:focus { outline: none; border-color: #0ea5e9; }
  .separator { border: none; border-top: 1px solid #334155; margin: 12px 0; }
  .upload-row { display: flex; align-items: center; gap: 8px; margin-top: 8px; }
  .file-input { font-size: 12px; color: #94a3b8; }
  .empty-images { color: #64748b; font-size: 13px; font-style: italic; margin-bottom: 12px; }
  .files-grid { display: flex; flex-wrap: wrap; gap: 8px; }
  .file-chip { background: #1e293b; border: 1px solid #334155; border-radius: 6px; padding: 6px 10px; font-size: 12px; color: #94a3b8; }
  .file-chip.orphan { border-color: #6d28d9; color: #a78bfa; }
  .file-chip.referenced { border-color: #166534; color: #4ade80; }
  .stats { display: flex; gap: 16px; margin-bottom: 32px; }
  .stat { background: #1e293b; border: 1px solid #334155; border-radius: 10px; padding: 16px 20px; flex: 1; }
  .stat-val { font-size: 28px; font-weight: 700; }
  .stat-lab { font-size: 12px; color: #64748b; margin-top: 2px; }
  .stat-val.warn { color: #f59e0b; }
  .stat-val.ok   { color: #4ade80; }
  .stat-val.info { color: #38bdf8; }
</style>
</head>
<body>
<div class="header">
  <h1>ZaamSport — Dashboard Images</h1>
  <span class="badge">LOCAL</span>
</div>
<div class="container">

<?php if ($message): ?>
  <div class="alert <?= htmlspecialchars($messageType) ?>"><?= htmlspecialchars($message) ?></div>
<?php endif; ?>

<?php
  $totalCenters  = count($centers);
  $centersLocal  = 0; $centersCloud = 0; $centersEmpty = 0;
  foreach ($centers as $c) {
      $imgs = json_decode($c['images'], true) ?? [];
      if (empty($imgs)) { $centersEmpty++; continue; }
      $hasLocal = false;
      foreach ($imgs as $img) { if (!str_starts_with($img, 'http')) $hasLocal = true; }
      $hasLocal ? $centersLocal++ : $centersCloud++;
  }
?>
<div class="stats">
  <div class="stat"><div class="stat-val info"><?= $totalCenters ?></div><div class="stat-lab">Centres total</div></div>
  <div class="stat"><div class="stat-val warn"><?= $centersLocal ?></div><div class="stat-lab">Avec images locales (à migrer)</div></div>
  <div class="stat"><div class="stat-val ok"><?= $centersCloud ?></div><div class="stat-lab">Sur Cloudinary</div></div>
  <div class="stat"><div class="stat-val" style="color:#64748b"><?= $centersEmpty ?></div><div class="stat-lab">Sans images</div></div>
</div>

<!-- CENTRES -->
<div class="section">
  <h2>Centres et leurs images</h2>
  <?php foreach ($centers as $center):
    $images = json_decode($center['images'], true) ?? [];
  ?>
  <div class="center-card">
    <div class="center-header">
      <span class="center-id">#<?= $center['id'] ?></span>
      <span class="center-name"><?= htmlspecialchars($center['name']) ?></span>
      <span class="status <?= $center['status'] ?>"><?= $center['status'] ?></span>
    </div>
    <div class="center-body">
      <?php if (empty($images)): ?>
        <p class="empty-images">Aucune image enregistrée.</p>
      <?php else: ?>
      <div class="images-grid">
        <?php foreach ($images as $idx => $img):
          $isLocal = !str_starts_with($img, 'http');
          $isDuplicate = !$isLocal && str_contains($img, 'zaamsport/centers/zaamsport/centers/');
          $localFull = $isLocal ? (__DIR__ . '/../backend/' . ltrim($img, '/')) : null;
          $fileExists = $localFull && file_exists($localFull);
          $slotClass = $isLocal ? 'local' : ($isDuplicate ? 'duplicate' : 'cloud');
        ?>
        <div class="img-slot <?= $slotClass ?>">
          <?php if (!$isLocal): ?>
            <img src="<?= htmlspecialchars($img) ?>" class="img-preview" loading="lazy">
          <?php elseif ($fileExists): ?>
            <img src="/uploads/<?= htmlspecialchars(basename($img)) ?>" class="img-preview" loading="lazy" onerror="this.style.display='none'">
          <?php else: ?>
            <div class="img-preview-placeholder">🖼️</div>
          <?php endif; ?>
          <div class="img-meta">
            <div class="img-type <?= $isLocal ? 'local' : 'cloud' ?>" style="<?= $isDuplicate ? 'color:#a78bfa' : '' ?>">
              <?= $isLocal ? '⚠ Local' : ($isDuplicate ? '⚡ URL dupliquée' : '☁ Cloudinary') ?>
            </div>
            <div class="img-path"><?= htmlspecialchars($isLocal ? basename($img) : substr($img, strrpos($img, '/') + 1)) ?></div>
            <div class="img-actions">
              <?php if ($isDuplicate): ?>
              <!-- Corriger URL dupliquée sur Cloudinary -->
              <form method="POST" onsubmit="return confirm('Renommer le fichier sur Cloudinary et corriger l\'URL ?')">
                <input type="hidden" name="action" value="fix_duplicate_url">
                <input type="hidden" name="center_id" value="<?= $center['id'] ?>">
                <input type="hidden" name="img_index" value="<?= $idx ?>">
                <input type="hidden" name="old_url" value="<?= htmlspecialchars($img) ?>">
                <button type="submit" class="btn" style="background:#4c1d95;color:#ddd8fe;width:100%">⚡ Corriger doublon</button>
              </form>
              <?php endif; ?>
              <?php if ($isLocal && $fileExists): ?>
              <!-- Migration automatique -->
              <form method="POST">
                <input type="hidden" name="action" value="migrate_local">
                <input type="hidden" name="center_id" value="<?= $center['id'] ?>">
                <input type="hidden" name="img_index" value="<?= $idx ?>">
                <input type="hidden" name="local_path" value="<?= htmlspecialchars($img) ?>">
                <button type="submit" class="btn btn-migrate">↑ Migrer vers Cloudinary</button>
              </form>
              <?php endif; ?>
              <!-- Remplacer par URL manuelle -->
              <form method="POST" class="url-form">
                <input type="hidden" name="action" value="update_url">
                <input type="hidden" name="center_id" value="<?= $center['id'] ?>">
                <input type="hidden" name="img_index" value="<?= $idx ?>">
                <input type="text" name="new_url" placeholder="https://res.cloudinary.com/..." class="url-input">
                <button type="submit" class="btn btn-primary">Enregistrer URL</button>
              </form>
              <!-- Supprimer -->
              <form method="POST" onsubmit="return confirm('Supprimer cette image ?')">
                <input type="hidden" name="action" value="delete_image">
                <input type="hidden" name="center_id" value="<?= $center['id'] ?>">
                <input type="hidden" name="img_index" value="<?= $idx ?>">
                <button type="submit" class="btn btn-delete">✕ Supprimer</button>
              </form>
            </div>
          </div>
        </div>
        <?php endforeach; ?>
      </div>
      <?php endif; ?>

      <hr class="separator">
      <!-- Ajouter une nouvelle image -->
      <form method="POST" enctype="multipart/form-data">
        <input type="hidden" name="action" value="upload_file">
        <input type="hidden" name="center_id" value="<?= $center['id'] ?>">
        <div class="upload-row">
          <input type="file" name="image_file" accept="image/*" class="file-input">
          <button type="submit" class="btn btn-primary">+ Uploader vers Cloudinary</button>
        </div>
      </form>
    </div>
  </div>
  <?php endforeach; ?>
</div>

<!-- INVENTAIRE FICHIERS LOCAUX -->
<div class="section">
  <h2>Fichiers locaux dans uploads/centers/ (<?= count($localFiles) ?> fichiers)</h2>
  <?php if (empty($localFiles)): ?>
    <p style="color:#64748b;font-size:13px">Aucun fichier local.</p>
  <?php else: ?>
  <div class="files-grid">
    <?php foreach ($localFiles as $f):
      $key = 'uploads/centers/' . $f;
      $isRef = isset($referencedLocal[$key]);
    ?>
    <div class="file-chip <?= $isRef ? 'referenced' : 'orphan' ?>" title="<?= $isRef ? 'Utilisé par : ' . htmlspecialchars($referencedLocal[$key]) : 'Non référencé en base' ?>">
      <?= $isRef ? '✓' : '?' ?> <?= htmlspecialchars($f) ?>
    </div>
    <?php endforeach; ?>
  </div>
  <p style="font-size:12px;color:#64748b;margin-top:10px">
    <span style="color:#4ade80">✓ vert</span> = référencé en base &nbsp;|&nbsp;
    <span style="color:#a78bfa">? violet</span> = fichier orphelin (pas en base)
  </p>
  <?php endif; ?>
</div>

</div>
</body>
</html>

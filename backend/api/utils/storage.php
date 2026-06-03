<?php
// utils/storage.php
// Couche d'abstraction pour le stockage des fichiers uploadés.
//
// Backend choisi via la variable d'environnement STORAGE_DRIVER :
//   - "local"      (défaut) : enregistre dans uploads/centers/ et renvoie une URL relative.
//   - "cloudinary" : envoie vers Cloudinary et renvoie l'URL publique sécurisée.

class Storage {
    public static function driver() {
        return getenv('STORAGE_DRIVER') ?: 'local';
    }

    public static function uploadCenterImage($tmpPath, $originalName) {
        if (self::driver() === 'cloudinary') {
            return self::uploadToCloudinary($tmpPath, $originalName);
        }
        return self::uploadToLocal($tmpPath, $originalName);
    }

    // ── Compression GD ──────────────────────────────────────────────────────────
    // Redimensionne + recompresse si > 8 MB ou > 1920px.
    // Retourne le chemin du fichier à uploader (tmp si compressé, original sinon).
    private static function compress(string $sourcePath): string {
        $limitBytes = 8 * 1024 * 1024;
        $maxDim     = 1920;

        if (!function_exists('imagecreatefromjpeg')) return $sourcePath;

        $size = filesize($sourcePath);
        $mime = mime_content_type($sourcePath) ?: '';

        $src = match(true) {
            str_contains($mime, 'jpeg'), str_contains($mime, 'jpg') => @imagecreatefromjpeg($sourcePath),
            str_contains($mime, 'png')  => @imagecreatefrompng($sourcePath),
            str_contains($mime, 'webp') => function_exists('imagecreatefromwebp') ? @imagecreatefromwebp($sourcePath) : null,
            default                     => null,
        };

        if (!$src) return $sourcePath;

        $w = imagesx($src);
        $h = imagesy($src);

        $needsResize = ($w > $maxDim || $h > $maxDim);
        $needsCompress = ($size > $limitBytes);

        if (!$needsResize && !$needsCompress) {
            imagedestroy($src);
            return $sourcePath;
        }

        if ($needsResize) {
            $ratio = min($maxDim / $w, $maxDim / $h);
            $nw = (int)($w * $ratio);
            $nh = (int)($h * $ratio);
            $dst = imagecreatetruecolor($nw, $nh);
            // Préserver la transparence PNG
            imagealphablending($dst, false);
            imagesavealpha($dst, true);
            imagecopyresampled($dst, $src, 0, 0, 0, 0, $nw, $nh, $w, $h);
            imagedestroy($src);
            $src = $dst;
        }

        $tmpPath = tempnam(sys_get_temp_dir(), 'zs_img_') . '.jpg';
        imagejpeg($src, $tmpPath, 82);
        imagedestroy($src);

        error_log('[Storage] Image compressée : ' . round($size / 1024 / 1024, 2) . ' MB → ' . round(filesize($tmpPath) / 1024 / 1024, 2) . ' MB');
        return $tmpPath;
    }

    // ── Drivers ─────────────────────────────────────────────────────────────────
    private static function uploadToLocal($tmpPath, $originalName) {
        $filename  = uniqid() . '_' . basename($originalName);
        $uploadDir = __DIR__ . '/../../uploads/centers/';
        if (!is_dir($uploadDir)) @mkdir($uploadDir, 0775, true);
        if (move_uploaded_file($tmpPath, $uploadDir . $filename)) {
            return 'uploads/centers/' . $filename;
        }
        return null;
    }

    private static function uploadToCloudinary($tmpPath, $originalName) {
        $cloudName = getenv('CLOUDINARY_CLOUD_NAME');
        $apiKey    = getenv('CLOUDINARY_API_KEY');
        $apiSecret = getenv('CLOUDINARY_API_SECRET');

        if (!$cloudName || !$apiKey || !$apiSecret) {
            error_log('Storage Cloudinary: configuration incomplète');
            return null;
        }

        // Compression avant upload
        $pathToUpload = self::compress($tmpPath);
        $isTmp = ($pathToUpload !== $tmpPath);

        $timestamp = time();
        $folder    = 'zaamsport/centers';
        $publicId  = uniqid();

        $paramsToSign = "folder={$folder}&public_id={$publicId}&timestamp={$timestamp}";
        $signature    = sha1($paramsToSign . $apiSecret);

        $ch = curl_init("https://api.cloudinary.com/v1_1/{$cloudName}/image/upload");
        curl_setopt_array($ch, [
            CURLOPT_RETURNTRANSFER => true,
            CURLOPT_POST           => true,
            CURLOPT_POSTFIELDS     => [
                'file'      => new CURLFile($pathToUpload, 'image/jpeg', basename($originalName)),
                'api_key'   => $apiKey,
                'timestamp' => $timestamp,
                'folder'    => $folder,
                'public_id' => $publicId,
                'signature' => $signature,
            ],
            CURLOPT_TIMEOUT => 60,
        ]);

        $response = curl_exec($ch);
        $httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
        curl_close($ch);

        if ($isTmp) @unlink($pathToUpload);

        if ($httpCode !== 200 || !$response) {
            error_log('Storage Cloudinary erreur HTTP ' . $httpCode . ': ' . $response);
            return null;
        }

        $data = json_decode($response, true);
        if (empty($data['secure_url'])) {
            error_log('Storage Cloudinary: réponse inattendue: ' . $response);
            return null;
        }

        return $data['secure_url'];
    }
}

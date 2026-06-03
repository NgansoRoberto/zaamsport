<?php
// utils/storage.php
// Couche d'abstraction pour le stockage des fichiers uploadés.
//
// Backend choisi via la variable d'environnement STORAGE_DRIVER :
//   - "local"      (défaut) : enregistre dans uploads/centers/ et renvoie une URL relative.
//   - "cloudinary" : envoie vers Cloudinary et renvoie l'URL publique sécurisée.
//
// Variables Cloudinary attendues :
//   CLOUDINARY_CLOUD_NAME   ex: myapp
//   CLOUDINARY_API_KEY      ex: 123456789012345
//   CLOUDINARY_API_SECRET   ex: aBcDeFgHiJkLmNoPqRsTuVwXyZ

class Storage {
    public static function driver() {
        return getenv('STORAGE_DRIVER') ?: 'local';
    }

    /**
     * Upload un fichier issu de $_FILES (tmp path) et renvoie l'URL accessible publiquement.
     * @param string $tmpPath chemin temporaire du fichier
     * @param string $originalName nom d'origine
     * @return string|null url de l'image, ou null en cas d'échec
     */
    public static function uploadCenterImage($tmpPath, $originalName) {
        if (self::driver() === 'cloudinary') {
            return self::uploadToCloudinary($tmpPath, $originalName);
        }
        return self::uploadToLocal($tmpPath, $originalName);
    }

    private static function uploadToLocal($tmpPath, $originalName) {
        $filename = uniqid() . '_' . basename($originalName);
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

        $timestamp  = time();
        $folder     = 'zaamsport/centers';
        $publicId   = $folder . '/' . uniqid();

        // Signature Cloudinary : sha1 des paramètres triés + apiSecret
        $paramsToSign = "folder={$folder}&public_id={$publicId}&timestamp={$timestamp}";
        $signature    = sha1($paramsToSign . $apiSecret);

        $url = "https://api.cloudinary.com/v1_1/{$cloudName}/image/upload";

        $postFields = [
            'file'      => new CURLFile($tmpPath, mime_content_type($tmpPath) ?: 'image/jpeg', basename($originalName)),
            'api_key'   => $apiKey,
            'timestamp' => $timestamp,
            'folder'    => $folder,
            'public_id' => $publicId,
            'signature' => $signature,
        ];

        $ch = curl_init($url);
        curl_setopt_array($ch, [
            CURLOPT_RETURNTRANSFER => true,
            CURLOPT_POST           => true,
            CURLOPT_POSTFIELDS     => $postFields,
            CURLOPT_TIMEOUT        => 30,
        ]);

        $response = curl_exec($ch);
        $httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
        curl_close($ch);

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

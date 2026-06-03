<?php
// utils/storage.php
// Couche d'abstraction pour le stockage des fichiers uploadés.
//
// Backend choisi via la variable d'environnement STORAGE_DRIVER :
//   - "local" (défaut) : enregistre dans backend/uploads/centers/
//                         et renvoie une URL relative "uploads/centers/<file>".
//   - "r2"   : envoie vers Cloudflare R2 (compatible S3) et renvoie l'URL publique.
//
// Variables R2 attendues :
//   R2_ENDPOINT        ex: https://<accountid>.r2.cloudflarestorage.com
//   R2_BUCKET          nom du bucket
//   R2_ACCESS_KEY_ID
//   R2_SECRET_ACCESS_KEY
//   R2_PUBLIC_URL      base URL publique (custom domain R2 ou pub-XXX.r2.dev),
//                      ex: https://images.exemple.com

require_once __DIR__ . '/../vendor/autoload.php';

class Storage {
    public static function driver() {
        return getenv('STORAGE_DRIVER') ?: 'local';
    }

    /**
     * Upload un fichier issu de $_FILES (tmp path) et renvoie l'URL accessible publiquement.
     * @param string $tmpPath chemin temporaire du fichier
     * @param string $originalName nom d'origine
     * @return string|null url/chemin de l'image, ou null en cas d'échec
     */
    public static function uploadCenterImage($tmpPath, $originalName) {
        $filename = uniqid() . '_' . basename($originalName);

        if (self::driver() === 'r2') {
            return self::uploadToR2($tmpPath, $filename);
        }
        return self::uploadToLocal($tmpPath, $filename);
    }

    private static function uploadToLocal($tmpPath, $filename) {
        $uploadDir = __DIR__ . '/../../uploads/centers/';
        if (!is_dir($uploadDir)) @mkdir($uploadDir, 0775, true);
        if (move_uploaded_file($tmpPath, $uploadDir . $filename)) {
            return 'uploads/centers/' . $filename;
        }
        return null;
    }

    private static function uploadToR2($tmpPath, $filename) {
        $endpoint = getenv('R2_ENDPOINT');
        $bucket = getenv('R2_BUCKET');
        $accessKey = getenv('R2_ACCESS_KEY_ID');
        $secretKey = getenv('R2_SECRET_ACCESS_KEY');
        $publicUrl = rtrim(getenv('R2_PUBLIC_URL') ?: '', '/');

        if (!$endpoint || !$bucket || !$accessKey || !$secretKey || !$publicUrl) {
            error_log('Storage R2: configuration incomplète');
            return null;
        }

        $key = 'centers/' . $filename;

        try {
            $s3 = new Aws\S3\S3Client([
                'version' => 'latest',
                'region'  => 'auto',
                'endpoint' => $endpoint,
                'use_path_style_endpoint' => true,
                'credentials' => [
                    'key' => $accessKey,
                    'secret' => $secretKey,
                ],
            ]);

            $contentType = mime_content_type($tmpPath) ?: 'application/octet-stream';

            $s3->putObject([
                'Bucket' => $bucket,
                'Key' => $key,
                'SourceFile' => $tmpPath,
                'ContentType' => $contentType,
                'CacheControl' => 'public, max-age=31536000, immutable',
            ]);

            return $publicUrl . '/' . $key;
        } catch (Throwable $e) {
            error_log('Storage R2 erreur: ' . $e->getMessage());
            return null;
        }
    }
}

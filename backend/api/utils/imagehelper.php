<?php
// Remplace les chemins locaux (non-http) par l'image par défaut.
// Si DEFAULT_IMAGE_URL n'est pas définie, les chemins locaux sont simplement supprimés.
function normalize_images(array $images): array {
    $default = getenv('DEFAULT_IMAGE_URL') ?: '';
    $result  = [];
    foreach ($images as $img) {
        if (str_starts_with($img, 'http')) {
            $result[] = $img;
        } elseif ($default !== '') {
            $result[] = $default;
        }
    }
    // Si aucune image valide, on charge l'image par défaut du backend
    if (empty($result) && $default !== '') {
        $result[] = $default;
    }
    return $result;
}

<?php
// config/database.php

$host = 'localhost';
$port = '5432';
$dbname = 'lamfunsport';
$user = 'postgres';
$password = 'kenko';

// On initialise la variable à null par sécurité
$pdo = null;

try {
    // Création de la connexion PostgreSQL
    $pdo = new PDO("pgsql:host=$host;port=$port;dbname=$dbname;user=$user;password=$password");
    
    // Configuration des options PDO
    $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
    
    // Optionnel mais recommandé : force le retour des données sous forme de tableau associatif par défaut
    $pdo->setAttribute(PDO::ATTR_DEFAULT_FETCH_MODE, PDO::FETCH_ASSOC);

} catch (PDOException $e) {
    // On force un code de statut HTTP 500 pour indiquer une erreur serveur
    http_response_code(500);
    echo json_encode([
        'error' => 'Erreur de connexion à la base de données',
        'debug' => $e->getMessage() // À masquer en production !
    ]);
    exit;
}
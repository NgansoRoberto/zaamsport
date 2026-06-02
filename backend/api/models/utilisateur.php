<?php
class User {
    private $db;
    public function __construct($pdo) { $this->db = $pdo; }

    /**
     * Trouve un utilisateur par son email
     */
    public function findByEmail($email) {
        $stmt = $this->db->prepare("SELECT * FROM users WHERE email = ?");
        $stmt->execute([$email]);
        return $stmt->fetch(PDO::FETCH_ASSOC);
    }

    /**
     * Crée un nouvel utilisateur avec nom, prénom, email, mot de passe hashé et rôle
     */
    public function create($nom, $prenom, $email, $hash, $role) {
        $stmt = $this->db->prepare("
            INSERT INTO users (nom, prenom, email, password_hash, role) 
            VALUES (?, ?, ?, ?, ?) RETURNING id
        ");
        $stmt->execute([$nom, $prenom, $email, $hash, $role]);
        return $stmt->fetchColumn();
    }

    /**
     * Trouve un utilisateur par son ID
     */
    public function findById($id) {
        $stmt = $this->db->prepare("SELECT * FROM users WHERE id = ?");
        $stmt->execute([$id]);
        return $stmt->fetch(PDO::FETCH_ASSOC);
    }
}
?>
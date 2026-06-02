<?php
$hash = '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi';
$password = 'admin123';
if (password_verify($password, $hash)) {
    echo "OK, le mot de passe est correct";
} else {
    echo "ERREUR : le mot de passe ne correspond pas";
}
?>
<?php
// NetMood Analyzer - config.php
// Quick setup:
// 1. Place this project on any PHP 7.4+ host that supports SQLite.
// 2. Ensure the webserver user can write to the project folder (for SQLite DB and /assets uploads).
// 3. Protect /assets with the provided .htaccess (already included).

// Database file path (SQLite)
define('DB_PATH', __DIR__ . '/netmood.sqlite');

// Upload settings
define('UPLOAD_DIR', __DIR__ . '/assets');
define('MAX_FILE_SIZE', 10 * 1024 * 1024); // 10MB
define('ALLOWED_TYPES', ['csv', 'pcap']);

// Emotion colors and order
define('EMOTIONS', [
    'joy' => '#4CAF50',
    'stress' => '#F44336',
    'calm' => '#2196F3',
    'anger' => '#FF9800',
    'anxiety' => '#9C27B0',
]);

// Create DB and table if not exists
function get_db(): PDO {
    $needInit = !file_exists(DB_PATH);
    $pdo = new PDO('sqlite:' . DB_PATH);
    $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
    if ($needInit) {
        $sql = "CREATE TABLE results (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            filename TEXT NOT NULL,
            emotions_json TEXT NOT NULL,
            chart_json TEXT NOT NULL,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )";
        $pdo->exec($sql);
    }
    return $pdo;
}

// Helper: JSON response
function json_response($data, $status = 200) {
    http_response_code($status);
    header('Content-Type: application/json; charset=utf-8');
    echo json_encode($data, JSON_UNESCAPED_UNICODE);
    exit;
}

?>

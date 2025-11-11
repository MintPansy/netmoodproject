<?php
// results.php
// GET endpoint: /results.php?id=optional

require_once __DIR__ . '/config.php';

if ($_SERVER['REQUEST_METHOD'] !== 'GET') {
    json_response(['success' => false, 'error' => 'Invalid method. Use GET.'], 405);
}

$pdo = get_db();

$id = isset($_GET['id']) ? intval($_GET['id']) : null;
if ($id) {
    $stmt = $pdo->prepare('SELECT * FROM results WHERE id = :id');
    $stmt->execute([':id' => $id]);
    $row = $stmt->fetch(PDO::FETCH_ASSOC);
    if (!$row) json_response(['success' => false, 'error' => 'Not found'], 404);
    $row['emotions'] = json_decode($row['emotions_json'], true);
    $row['chart'] = json_decode($row['chart_json'], true);
    unset($row['emotions_json'], $row['chart_json']);
    json_response(['success' => true, 'result' => $row]);
} else {
    $stmt = $pdo->query('SELECT id, filename, emotions_json, chart_json, created_at FROM results ORDER BY created_at DESC LIMIT 100');
    $all = [];
    while ($r = $stmt->fetch(PDO::FETCH_ASSOC)) {
        $r['emotions'] = json_decode($r['emotions_json'], true);
        $r['chart'] = json_decode($r['chart_json'], true);
        unset($r['emotions_json'], $r['chart_json']);
        $all[] = $r;
    }
    json_response(['success' => true, 'results' => $all]);
}

?>

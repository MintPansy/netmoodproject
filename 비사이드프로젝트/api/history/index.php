<?php
header('Content-Type: application/json; charset=utf-8');
// Use the existing results DB to provide history if possible
require_once __DIR__ . '/../../config.php';
$pdo = get_db();
$stmt = $pdo->query('SELECT id, filename, emotions_json, created_at FROM results ORDER BY created_at DESC LIMIT 50');
$rows = [];
while($r = $stmt->fetch(PDO::FETCH_ASSOC)){
  $r['emotions'] = json_decode($r['emotions_json'], true);
  unset($r['emotions_json']);
  $rows[] = $r;
}
echo json_encode(['success'=>true,'history'=>$rows]);

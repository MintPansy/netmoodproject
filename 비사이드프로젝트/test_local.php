<?php
// test_local.php - quick local verification script
require_once __DIR__ . '/config.php';
require_once __DIR__ . '/analyze.php';

$csv = __DIR__ . '/sample.csv';
$records = parse_csv_file($csv);
$res = analyze_records($records);

// Save to DB
$pdo = get_db();
$stmt = $pdo->prepare('INSERT INTO results (filename, emotions_json, chart_json) VALUES (:fn, :e, :c)');
$stmt->execute([
    ':fn' => basename($csv),
    ':e' => json_encode($res['emotions'], JSON_UNESCAPED_UNICODE),
    ':c' => json_encode($res['chartData'], JSON_UNESCAPED_UNICODE),
]);

echo json_encode(['ok' => true, 'emotions' => $res['emotions'], 'chart' => $res['chartData']], JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE);

?>

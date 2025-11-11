<?php
// upload.php
// POST endpoint that accepts a file upload (csv or pcap), analyzes it, stores result in SQLite and returns JSON for Chart.js

require_once __DIR__ . '/config.php';
require_once __DIR__ . '/analyze.php';

// Allow only POST
if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    json_response(['success' => false, 'error' => 'Invalid method. Use POST.'], 405);
}

if (empty($_FILES['file'])) {
    json_response(['success' => false, 'error' => 'No file uploaded.'], 400);
}

$file = $_FILES['file'];
if ($file['error'] !== UPLOAD_ERR_OK) {
    json_response(['success' => false, 'error' => 'Upload error code: ' . $file['error']], 400);
}

if ($file['size'] > MAX_FILE_SIZE) {
    json_response(['success' => false, 'error' => 'File too large. Max 10MB.'], 400);
}

$ext = strtolower(pathinfo($file['name'], PATHINFO_EXTENSION));
if (!in_array($ext, ALLOWED_TYPES)) {
    json_response(['success' => false, 'error' => 'Invalid file type. Only CSV or PCAP allowed.'], 400);
}

// sanitize filename and move
$safeName = preg_replace('/[^A-Za-z0-9_.-]/', '_', basename($file['name']));
$target = UPLOAD_DIR . '/' . uniqid('upload_', true) . '_' . $safeName;

if (!move_uploaded_file($file['tmp_name'], $target)) {
    json_response(['success' => false, 'error' => 'Failed saving uploaded file.'], 500);
}

// Parse: for PCAP we assume CSV conversion or simple text parsing: try CSV parser
$records = [];
if ($ext === 'csv') {
    $records = parse_csv_file($target);
} else {
    // pcap: attempt to read as text and parse numbers heuristically (best-effort)
    $content = file_get_contents($target);
    // simple heuristic: extract lines with numbers separated by commas or spaces
    $lines = preg_split('/\r\n|\n|\r/', $content);
    foreach ($lines as $line) {
        $line = trim($line);
        if ($line === '') continue;
        // try CSV parse
        $parts = str_getcsv($line);
        if (count($parts) > 1) {
            $rec = [];
            foreach ($parts as $i => $p) $rec['col'.$i] = $p;
            $records[] = $rec;
            continue;
        }
        // otherwise extract numbers
        preg_match_all('/[-+]?[0-9]*\.?[0-9]+/', $line, $m);
        if (!empty($m[0])) {
            $rec = [];
            foreach ($m[0] as $i => $v) $rec['col'.$i] = $v;
            $records[] = $rec;
        }
    }
}

$res = analyze_records($records);

// Save to DB
$pdo = get_db();
$stmt = $pdo->prepare('INSERT INTO results (filename, emotions_json, chart_json) VALUES (:fn, :e, :c)');
$stmt->execute([
    ':fn' => $safeName,
    ':e' => json_encode($res['emotions'], JSON_UNESCAPED_UNICODE),
    ':c' => json_encode($res['chartData'], JSON_UNESCAPED_UNICODE),
]);
$id = $pdo->lastInsertId();

// Build response
$response = [
    'success' => true,
    'id' => $id,
    'filename' => $safeName,
    'emotions' => $res['emotions'],
    'chartData' => $res['chartData'],
    'advice' => generate_advice($res['emotions']),
];

json_response($response);

// Simple advice generator
function generate_advice(array $emotions): array {
    // find highest emotion
    arsort($emotions);
    $top = key($emotions);
    $advice = [];
    switch ($top) {
        case 'joy':
            $advice['title'] = '현재: 평온/활발한 네트워크 활동';
            $advice['message'] = '트래픽이 원활하며 지연이 낮습니다. 문제가 없어 보입니다.';
            break;
        case 'stress':
            $advice['title'] = '경고: 지연/부하 징후';
            $advice['message'] = '지연이 높습니다. 네트워크를 재시작하거나 연결을 점검하세요.';
            break;
        case 'calm':
            $advice['title'] = '현재: 안정적/저활동';
            $advice['message'] = '네트워크 활동이 적고 안정적입니다.';
            break;
        case 'anger':
            $advice['title'] = '주의: 불규칙성 감지';
            $advice['message'] = '비정상 패턴이 관찰됩니다. 장비를 점검하거나 로그를 확인하세요.';
            break;
        case 'anxiety':
            $advice['title'] = '주의: 불안정 연결';
            $advice['message'] = '연결이 불안정합니다. 라우터를 재부팅하거나 케이블을 확인하세요.';
            break;
        default:
            $advice['title'] = '상태 확인 필요';
            $advice['message'] = '데이터가 부족하거나 해석이 필요합니다.';
    }
    return $advice;
}

?>

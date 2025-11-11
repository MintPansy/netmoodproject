<?php
// analyze.php
// Simple rule-based emotion analysis.
// Expects parsed records: array of associative arrays with keys like 'size', 'delay', 'error', 'irregular'

require_once __DIR__ . '/config.php';

/**
 * Analyze records and return normalized emotion percentages and chart data for Chart.js
 * @param array $records
 * @return array [ 'emotions' => ['joy'=>..], 'chartData' => ... ]
 */
function analyze_records(array $records): array {
    // Initialize counters
    $scores = array_fill_keys(array_keys(EMOTIONS), 0);
    $count = count($records);
    if ($count === 0) {
        // default neutral: calm high
        $scores['calm'] = 1;
        return finalize_scores($scores);
    }

    foreach ($records as $r) {
        // normalize keys
        $size = isset($r['size']) ? floatval($r['size']) : (isset($r['packet_size']) ? floatval($r['packet_size']) : 0);
        $delay = isset($r['delay']) ? floatval($r['delay']) : (isset($r['latency']) ? floatval($r['latency']) : 0);
        $error = isset($r['error']) ? intval($r['error']) : 0;
        $irregular = isset($r['irregular']) ? intval($r['irregular']) : 0;

        // Rules (simple heuristics)
        if ($size > 1000 && $delay < 50) {
            $scores['joy'] += 2;
        }
        if ($delay > 200) {
            $scores['stress'] += 2;
        }
        if ($size < 200 && $delay < 100) {
            $scores['calm'] += 1;
        }
        if ($irregular || ($size > 2000 && $delay > 500)) {
            $scores['anger'] += 2;
        }
        if ($delay > 100 && $delay < 300 && $error) {
            $scores['anxiety'] += 2;
        }
        // small adjustments
        if ($error) {
            $scores['stress'] += 1;
            $scores['anxiety'] += 1;
        }
    }

    return finalize_scores($scores);
}

function finalize_scores(array $scores): array {
    // ensure non-zero
    $total = array_sum($scores);
    if ($total <= 0) {
        // default calm
        $scores = array_map(function($k){ return $k === 'calm' ? 1 : 0; }, array_keys($scores));
        $total = 1;
    }

    // Normalize to percentages 0-100
    $percent = [];
    foreach ($scores as $k => $v) {
        $percent[$k] = round(($v / $total) * 100, 1);
    }

    // Build Chart.js friendly payload
    $labels = array_map('ucfirst', array_keys($percent));
    $data = array_values($percent);
    $colors = array_values(EMOTIONS);

    return [
        'emotions' => $percent,
        'chartData' => [
            'labels' => $labels,
            'data' => $data,
            'colors' => $colors,
        ]
    ];
}

// Helper to parse CSV lines into records if needed by upload.php
function parse_csv_file(string $path): array {
    $out = [];
    if (!is_readable($path)) return $out;
    if (($handle = fopen($path, 'r')) !== false) {
        $headers = null;
        while (($row = fgetcsv($handle)) !== false) {
            if ($headers === null) {
                // first row is header if contains non-numeric
                $isHeader = false;
                foreach ($row as $cell) { if (!is_numeric($cell)) { $isHeader = true; break; } }
                if ($isHeader) { $headers = $row; continue; }
                // otherwise, create generic headers
                $headers = array_map(function($i){ return 'col'.$i; }, array_keys($row));
            }
            $rec = [];
            foreach ($row as $i => $cell) {
                $key = $headers[$i] ?? 'col'.$i;
                $rec[$key] = $cell;
            }
            $out[] = $rec;
        }
        fclose($handle);
    }
    return $out;
}

?>

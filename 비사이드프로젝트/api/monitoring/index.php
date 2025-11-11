<?php
header('Content-Type: application/json; charset=utf-8');
echo json_encode(['status' => 'ok', 'connections' => rand(10,120), 'latency_ms' => rand(20,400)]);

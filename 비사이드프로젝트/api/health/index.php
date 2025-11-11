<?php
header('Content-Type: application/json; charset=utf-8');
echo json_encode(['status' => 'ok', 'time' => date(DATE_ATOM)]);

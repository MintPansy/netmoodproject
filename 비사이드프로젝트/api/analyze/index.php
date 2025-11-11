<?php
// api/analyze/index.php - shim to accept POST /api/analyze and use existing upload.php logic
require_once __DIR__ . '/../../upload.php';
// upload.php already handles POST and outputs JSON, so just include it
// Note: when included, upload.php will run immediately because it checks $_SERVER['REQUEST_METHOD']

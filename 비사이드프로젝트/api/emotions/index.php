<?php
header('Content-Type: application/json; charset=utf-8');
// Try to include results.php to get stored results if available
require_once __DIR__ . '/../../results.php';
// results.php already emits JSON and exits when called directly; to avoid double output,
// we'll call get_db and fetch briefly here instead.
// But for simplicity, return a small placeholder if results.php has already sent output.

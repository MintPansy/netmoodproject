<?php
// cleanup_uploads.php
// Usage: php cleanup_uploads.php
// This script removes files in the assets/ folder older than X days (default 30).

$dir = __DIR__ . '/../assets';
$days = 30; // change if needed
$now = time();
$deleted = 0;
if (!is_dir($dir)) {
    echo "assets folder not found: $dir\n";
    exit(0);
}
$files = scandir($dir);
foreach ($files as $f) {
    if ($f === '.' || $f === '..') continue;
    $path = $dir . '/' . $f;
    if (!is_file($path)) continue;
    $age = ($now - filemtime($path)) / (60*60*24);
    if ($age > $days) {
        if (@unlink($path)) $deleted++;
    }
}
echo "Deleted $deleted files older than $days days\n";

// Windows Task Scheduler / PowerShell sample to run daily:
// powershell.exe -Command "& { php 'C:\Users\goni1\OneDrive\바탕 화면\비사이드프로젝트2\scripts\cleanup_uploads.php' }"

?>
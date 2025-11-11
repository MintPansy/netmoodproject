Param()
# Auto commit & push for Windows PowerShell
# 실행 환경: PowerShell (권한에 따라 실행 정책을 허용해야 할 수 있음)

# 현재 디렉터리가 git repo 루트가 아니면 탐색
try {
    $repoRoot = git rev-parse --show-toplevel 2>$null
} catch {
    Write-Host "Not inside a git repository. Exiting."
    exit 0
}
Set-Location $repoRoot.Trim()

# 변경사항 확인
$result = git status --porcelain
if ([string]::IsNullOrWhiteSpace($result)) {
    Write-Host "No changes to commit."
    exit 0
}

# stage all
git add -A

$staged = git diff --cached --name-only --no-renames
if ([string]::IsNullOrWhiteSpace($staged)) {
    Write-Host "Nothing staged after git add. Exiting."
    exit 0
}

# commit message 생성
$files = $staged -split "`n" | Where-Object { $_ -ne "" }
$count = $files.Count
$summary = ($files | Select-Object -First 5) -join ', '
if ($count -gt 5) { $summary += ", ..." }
$timestamp = (Get-Date).ToUniversalTime().ToString("yyyy-MM-dd HH:mm:ss 'UTC'")
$commitMsg = "Auto: $count file(s) changed: $summary — $timestamp"

git commit -m $commitMsg

$branch = git rev-parse --abbrev-ref HEAD

# pull --rebase (best-effort)
try {
    git pull --rebase --autostash origin $branch
} catch {
    Write-Host "Warning: git pull --rebase failed. Please resolve remote changes manually."
}

try {
    git push origin $branch
    Write-Host "Pushed to origin/$branch"
} catch {
    Write-Host "Push failed. Resolve remote changes and push manually."
}
#!/usr/bin/env bash
set -euo pipefail

# 자동 커밋 & 푸시 스크립트
# 사용법: 워크스페이스 루트(또는 git 레포 내부)에서 실행되며
# 변경사항이 없으면 종료, 있으면 stage -> commit -> pull --rebase -> push

# 안전: 스크립트는 git 레포가 아닌 곳에서 실행 시 아무 동작 안함.
repo_root="$(git rev-parse --show-toplevel 2>/dev/null || true)"
if [ -z "$repo_root" ]; then
  echo "Not inside a git repository. Exiting."
  exit 0
fi
cd "$repo_root"

# 변경 사항이 없으면 종료 (작업 트리 기준)
if git diff --quiet --ignore-submodules --; then
  # working tree clean
  echo "No changes to commit."
  exit 0
fi

# stage all (respect .gitignore)
git add -A

# get staged files list
staged_list="$(git diff --cached --name-only --no-renames || true)"
if [ -z "$staged_list" ]; then
  echo "Nothing staged after git add. Exiting."
  exit 0
fi

# build commit message
file_count=$(echo "$staged_list" | sed '/^\s*$/d' | wc -l | tr -d ' ')
summary=$(echo "$staged_list" | head -n 5 | tr '\n' ', ' | sed 's/, $//')
timestamp=$(date -u +"%Y-%m-%d %H:%M:%S UTC")
if [ "$file_count" -gt 5 ]; then
  summary="$summary, ..."
fi
commit_msg="Auto: ${file_count} file(s) changed: ${summary} — ${timestamp}"

# commit
git commit -m "$commit_msg" || { echo "git commit failed"; exit 1; }

# determine current branch
branch="$(git rev-parse --abbrev-ref HEAD)"

# try to pull rebase (best-effort) then push
# If pull fails (conflict), we warn and stop to avoid overwriting remote changes.
if git pull --rebase --autostash origin "$branch"; then
  echo "Pulled remote changes (rebase) successfully."
else
  echo "Warning: git pull --rebase failed. Please resolve remote changes manually."
  # still attempt push; if rejected, push will fail.
fi

if git push origin "$branch"; then
  echo "Pushed to origin/$branch"
else
  echo "Push failed. You may need to resolve remote changes and push manually."
fi

exit 0
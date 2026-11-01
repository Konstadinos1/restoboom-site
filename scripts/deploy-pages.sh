#!/usr/bin/env bash
# Build the static site and publish out/ to the gh-pages branch.
# Usage: bash scripts/deploy-pages.sh
set -euo pipefail
cd "$(dirname "$0")/.."

npm run build

# Next's export emits its own default 404.html; restore our French one.
cp public/404.html out/404.html

rm -rf .ghp
cp -r out .ghp
touch .ghp/.nojekyll

cd .ghp
git init -b gh-pages -q
git add -A
git commit -q -m "Deploy static site $(date -u '+%Y-%m-%d %H:%M UTC')"
if git remote get-url origin >/dev/null 2>&1; then
  git remote set-url origin https://github.com/Konstadinos1/restoboom-site.git
else
  git remote add origin https://github.com/Konstadinos1/restoboom-site.git
fi
git push -f origin gh-pages
cd ..
rm -rf .ghp
echo "Deployed to gh-pages. Check https://konstadinos1.github.io/restoboom-site/"

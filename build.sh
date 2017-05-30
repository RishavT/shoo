#!/bin/bash
mkdir -p ./dist
cp -r ./js ./css ./*.html ./dist
cd ./dist
if ! [[ -d "./.git" ]]
then
  git init
  git remote add origin $DEPLOYMENT_GIT_REPO
  git checkout -B gh-pages
  git add .
  git commit -m "Deployed  $(date '+%d/%m/%Y_%H:%M:%S')"
  git push origin gh-pages
  cd ..
  echo "Deployed at $DEPLOYMENT_GIT_REPO branch - gh-pages"
fi



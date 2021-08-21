#!/usr/bin/env bash
# Push HTML files to gh-pages automatically.

# Fill this out with the correct org/repo
ORG=yunwan1x
REPO=my-document
# This probably should match an email for one of your users.
EMAIL=vs2010wy@live.cn

set -e

git remote add gh-token "https://${GH_TOKEN}@github.com/$ORG/$REPO.git";
git fetch gh-token && git fetch gh-token gh-pages:gh-pages;

# Update git configuration so I can push.
if [ "$1" != "dry" ]; then
    # Update git config.
    git config user.name "Travis Builder"
    git config user.email "$EMAIL"
fi

time=`date +'%Y-%m-%d %H:%M %Z'`
sed -i "s/.*本文档采用.*构建.*/本文档采用 [mkdocs](https:\/\/github.com\/mkdocs\/mkdocs) 构建，构建时间: $time /g" ./docs/index.md


mkdocs gh-deploy -v --clean --force --remote-name gh-token;

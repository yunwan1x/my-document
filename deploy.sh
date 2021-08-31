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

time=`TZ=UTC-8 date +'%m\/%d_%H:%M:%S_%z'`
times=`grep -Po 'push_times\-(\d+)\-'  ./docs/index.md |grep -Po '(\d+)' `
times=`expr $times + 1`

label="![CI](https:\/\/github.com\/yunwan1x\/my-document\/actions\/workflows\/documentation.yml\/badge.svg) ![buidtime](https:\/\/img.shields.io\/badge\/build_time-$time-519dd9.svg) ![push_times](https:\/\/img.shields.io\/badge\/push_times-$times-orange.svg)"
sed -i "s/.*\[buidtime\].*)/$label/g" ./docs/index.md


git add ./docs/index.md && git commit -m "update by github action" && git push
mkdocs gh-deploy -v --clean --force --remote-name gh-token;




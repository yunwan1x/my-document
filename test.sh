time=`TZ=UTC-8 date +'%m\/%d_%H:%M:%S_%z'`
times=`grep -Po 'push_times\-(\d+)\-'  ./docs/index.md |grep -Po '(\d+)' `
times=`expr $times + 1`


label="![CI](https:\/\/github.com\/yunwan1x\/my-document\/actions\/workflows\/documentation.yml\/badge.svg) ![buidtime](https:\/\/img.shields.io\/badge\/build_time-$time-519dd9.svg) ![push_times](https:\/\/img.shields.io\/badge\/push_times-$times-orange.svg)"
sed -i "s/.*\[buidtime\].*)/$label/g" ./docs/index.md


time=`TZ=UTC-8 date +'%m\/%d_%H:%M:%S_%z'`
times=`grep -Po 'push_times\-(\d+)\-'  ./docs/index.md |grep -Po '(\d+)' `
times=`expr $times + 1`

sed -i "s/.*\[buidtime\].*/![buidtime](https:\/\/img.shields.io\/badge\/build_time-$time-519dd9.svg) /g" ./docs/index.md
sed -i "s/.*\[push_times\].*/![push_times](https:\/\/img.shields.io\/badge\/push_times-$times-orange.svg) /g" ./docs/index.md

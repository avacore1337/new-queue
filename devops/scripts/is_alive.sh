#!/bin/bash

set -eu
set -o pipefail

restart_system(){
	systemctl restart queue.service
}

while true {
	sleep 90
	curl queue.csc.kth.se:8000 -m 15 | grep new-queue || restart_system
	curl localhost:8000/api/queues -m 15 | grep Allmanhandledning || restart_system
}

#!/bin/bash

set -eu
set -o pipefail

restart_system(){
	echo "Restarting queue"
	/bin/systemctl restart queue
}

while : 
do
	sleep 90
	curl localhost/api/queues -m 15 2>/dev/null | grep Allmanhandledning > /dev/null || restart_system
done


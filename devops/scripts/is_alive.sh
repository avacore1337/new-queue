#!/bin/bash

set -eu
set -o pipefail

restart_system(){
	# Sleep for 10 more seconds and restart system if it's still down. 
	# This is to prevent "systemctl restart queue" to trigger this script
	sleep 10
	curl localhost/api/queues -m 15 2>/dev/null | grep Allmanhandledning > /dev/null && return
	echo "Restarting queue"
	/bin/systemctl restart queue
}

while : 
do
	sleep 30
	curl localhost/api/queues -m 15 2>/dev/null | grep Allmanhandledning > /dev/null || restart_system
done


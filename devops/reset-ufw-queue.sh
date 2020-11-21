#!/bin/bash
## Firwall rules

set -euo pipefail

ufw --force reset

## Allow local traffic
ufw allow from 127.0.0.0/8
ufw allow from ::1
## Allow SSH (with restrictions)
##   KTH Networks (approximately, see https://www.lan.kth.se/norm/kth-prefixes.txt)
ufw allow from 130.237.0.0/16 to any port ssh proto tcp
ufw allow from 130.229.128.0/18 to any port ssh proto tcp
ufw allow from 2001:6b0:1::/48 to any port ssh proto tcp

#queue needed settings
ufw allow ssh/tcp
sudo ufw allow 7777
sudo ufw allow 80
sudo ufw allow 443
sudo ufw allow 8000

## Allow multicast
ufw allow to 224.0.0.1
ufw allow to ff02::1
## ... and link local communication
ufw allow from fe80::/64

ufw default allow outgoing
ufw default deny incoming

ufw --force enable

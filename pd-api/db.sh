#!/usr/bin/env bash
set -euo pipefail
IFS=$'\t\n'

IMAGE=docker.elastic.co/elasticsearch/elasticsearch:6.4.2
CONTAINER=pd-db
PORT=9200

cmd_rm() {
    docker stop ${CONTAINER} || true
    docker rm -fv ${CONTAINER} ||  true
}

cmd_run() {
    cmd_rm
    docker run -dt --name ${CONTAINER} \
        -p ${PORT}:${PORT} \
        -e "discovery.type=single-node" \
        ${IMAGE}
}

cmd_shell() {
    docker exec -it ${CONTAINER} bash
}

cmd_logs() {
    docker logs -f ${CONTAINER}
}

# Shortcuts
cmd_r() { cmd_run; }
cmd_l() { cmd_logs; }
cmd_s() { cmd_shell; }

# Print all defined cmd_
cmd_help() {
    compgen -A function cmd_
}

# Run multiple commands without args
cmd_mm() {
    for cmd in "$@"; do
        cmd_$cmd
    done
}

if [[ $# -eq 0 ]]; then
    echo Please provide a subcommand
    exit 1
fi

SUBCOMMAND=$1
shift

# Enable verbose mode
set -x
# Run the subcommand
cmd_${SUBCOMMAND} $@

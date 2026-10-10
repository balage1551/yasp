#!/bin/bash
# shellcheck disable=SC2034

print_usage() {
  cat <<EOF

Usage: start-frontend.sh [-s <service_name>] [-c <container_name>]

Options:
  -s <service_name>    The name of the service to start.
  -c <container_name>  The name of the container to start.

EOF
  exit 1
}

scope=
service_type="frontend"
service_name="${service_type}"
container_name=

while getopts "S:s:c:?" option; do
  case "${option}" in
    S)
      scope=${OPTARG}
      ;;
    s)
      service_name=${OPTARG}
      ;;
    c)
      container_name=${OPTARG}
      ;;
    ?)
      print_usage
      ;;
    *)
      ;;
  esac
done

if [ -z "$core_loaded" ]; then
  source "$(dirname "$0")/core.sh" "$scope"
fi

if [ -z "$container_name" ]; then
  container_name="${application_name}-${service_name}"
fi

header "Restarting frontend $service_name in container $container_name"

if [ "$debug" = true ]; then
  debug_print "Service type: $service_type"
  debug_print "Service name: $service_name"
  debug_print "Container name: $container_name"
fi

"$docker_cmd" compose -f "${compose_file}" -p "${application_name}" up --force-recreate -d "${service_name}"

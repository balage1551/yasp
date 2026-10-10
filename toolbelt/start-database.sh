#!/bin/bash
# shellcheck disable=SC2034

print_usage() {
  cat <<EOF
  Usage: start-database.sh [-S <scope>] [-s <service_name>] [-c <container_name>] [-w]

  Options:
    -S <scope>          The scope of the application. [Default: directory name]
    -s <service_name>   The name of the service to start. [Default: database]
    -c <container_name> The name of the container to start. [Default: <application-name>-<service_name>]
    -w                  Wait for the database to start.
EOF
  exit 1
}

scope=
service_name="database"
container_name=
wait_for_startup=false

while getopts "S:s:c:w?" option; do
  case "${option}" in
    S)
      scope=${OPTARG}
      ;;
    w)
      wait_for_startup=true
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

header "Starting $service_name (database) in container $container_name"

if [ "$debug" = true ]; then
  debug_print "Service name: $service_name"
  debug_print "Container name: $container_name"
  debug_print "Wait for startup: $wait_for_startup"
fi

docker compose -f "${compose_file}" -p "${application_name}" up -d "${service_name}"

if [ "$wait_for_startup" = true ]; then
  while ! "$docker_cmd" exec "${container_name}" pg_isready -U "${application_name}" 1>/dev/null; do
    sleep 1
  done
  colored_print "system" "Database started"
fi


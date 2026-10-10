#!/bin/bash
# shellcheck disable=SC2034

print_usage() {
  cat <<EOF

Usage: start-flyway.sh [-S <scope>] [-s <service_name>] [-c <container_name>] [-i] [-d]

Options:
  -S <scope>          The scope of the application. [Default: directory name]
  -s <service_name>    The name of the service to start. [Default: flyway]
  -c <container_name>  The name of the container to start. [Default: <application_name>-<service_name>]
  -i                   Do not terminate on error.
  -d                   Delete the container after running the Flyway migration.

EOF
  exit 1
}

scope=
service_type="flyway"
service_name="${service_type}"
container_name=
ignore_error=false
delete_container=false

while getopts "S:t:s:c:id?" option; do
  case "${option}" in
    S)
      scope=${OPTARG}
      ;;
    i)
      ignore_error=true
      ;;
    t)
      service_type=${OPTARG}
      ;;
    s)
      service_name=${OPTARG}
      ;;
    c)
      container_name=${OPTARG}
      ;;
    d)
      delete_container=true
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


header "Running flyway $service_name in container $container_name"

if [ "$debug" = true ]; then
  debug_print "Service type: $service_type"
  debug_print "Service name: $service_name"
  debug_print "Container name: $container_name"
  debug_print "Ignore error: $ignore_error"
  debug_print "Delete container: $delete_container"
fi

# Start the Flyway container
"$docker_cmd" compose -f "${compose_file}" -p "${application_name}" up -d "${service_name}"

wait_for_container "$service_type" "$container_name"
exit_code=$?

if [[ "$delete_container" = true ]]; then
  # Remove the Flyway container
  debug_print "Removing the Flyway container $container_name"
  container_id=$(docker ps -q -a -f "name=${container_name}")
  "$docker_cmd" rm "$container_id" > /dev/null
fi

if [ "$exit_code" -ne 0 ]; then
  if [ "$ignore_error" = true ]; then
    colored_print "system" "Flyway migration failed, but ignoring the error."
    exit_code=0
  else
    exit_code=42
  fi
fi

# Check the exit code
if [ "$exit_code" -ne 0 ]; then
  show_error "Database migration failed"
else
  colored_print "system" "Flyway migration was successful."
fi

exit "$exit_code"


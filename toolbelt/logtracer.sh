#!/bin/bash
# shellcheck disable=SC2034


print_usage() {
  cat <<EOF
Usage: logtracer.sh -s <service_name> [-c <container_name>] [-t <service_type>] [-p] [-g <filter>]

Options:
  -s <service_name>    The name of the service to trace.
  -c <container_name>  The name of the container to trace.
  -t <service_type>    The type of the service to trace.
  -p                   Prefix log messages with the service name.
  -g <filter>          Only show lines matching this extended-regex (grep -E) filter.

EOF
  exit 1
}

scope=""
service_type=""
service_name=""
container_name=""
prefixed=false
filter=""

while getopts "S:t:s:c:g:p?" option; do
  case "${option}" in
    S)
      scope=${OPTARG}
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
    g)
      filter=${OPTARG}
      ;;
    p)
      prefixed=true
      ;;
    ?)
      print_usage
      ;;
    *)
      ;;
  esac
done


if [ -z "$service_name" ]; then
  show_error "Error: Service name is required."
  exit 1
fi

if [ -z "$core_loaded" ]; then
  source "$(dirname "$0")/core.sh" "$scope"
fi

if [ -z "$container_name" ]; then
  container_name="${application_name}-${service_name}"
fi

if [ -z "$service_type" ]; then
  if [ -z "$service_type" ]; then
    service_type="${service_name##*-}"
  fi
fi

if [ "$debug" = true ]; then
  debug_print "Service type: $service_type"
  debug_print "Service name: $service_name"
  debug_print "Container name: $container_name"
  debug_print "Prefixed: $prefixed"
fi

prefix=""
if [[ "$prefixed" = true ]]; then
  prefix="[$service_name] "
fi

# Wait for the docker container to appear
retries=5
while [ -z "$container_id" ] && [ $retries -gt 0 ]; do
  container_id=$("$docker_cmd" ps -q -f "name=${container_name}" | tail -n 1)
  if [ -z "$container_id" ]; then
    sleep 1
    retries=$((retries - 1))
  fi
done

if [ -z "$container_id" ]; then
  colored_print "error" "ERROR: Docker container (${container_name}) for component '${service_name}' did not appear within 5 seconds."
  exit 1
fi

# Function to clean up the docker logs process
cleanup() {
  rm -f "$pipe"
  colored_print "debug" "Killing docker logs process $docker_logs_pid"
  if [ -n "$docker_logs_pid" ]; then
    kill "$docker_logs_pid" 2>&1 | grep -v "No such process"
  fi
}

decorate() {
  while IFS= read -r line; do
    if [ -n "$filter" ] && ! printf '%s' "$line" | grep -qE "$filter"; then
      continue
    fi
    colored_print "${service_type}" "$prefix$line"
  done
}

# Trap EXIT signal to ensure cleanup is called
trap cleanup EXIT

# Create a named pipe
pipe=$(mktemp -u -t "${container_name}-XXX.pipe")
mkfifo "$pipe"

# Start docker logs process and capture its PID
"$docker_cmd" logs -f "$container_id" > "$pipe" &
docker_logs_pid=$!
colored_print "debug" "Started docker logs process $docker_logs_pid"

# Start the decorator in the background
decorate < "$pipe" &

# Wait for the docker logs process to finish
wait "$docker_logs_pid"
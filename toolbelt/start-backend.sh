#!/bin/bash
# shellcheck disable=SC2034

print_usage() {
  cat <<EOF

Usage: start-backend.sh [-S <scope>] [-t <service_type>] [-s <service_name>] [-c <container_name>] [-C <compose_file>] [-g <gradle_target>] [-i] [-f] [-w] [-h] [-D]

Options:
  -S <scope>          The scope of the application. [Default: directory name]
  -t <service_type>    The type of the service to start. [Default: backend]
  -s <service_name>    The name of the service to start. [Default: backend]
  -c <container_name>  The name of the container to start. [Default: <application_name>-<service_name>]
  -C <compose_file>    The name of the compose file to use. [Default: docker-compose.yml]
  -g <gradle_target>   The Gradle target to build the backend. [Default: bootDistZip]
  -i                   Do not terminate on error.
  -f                   Force a clean build.
  -w                   Wait for the service to start.
  -D                   Do not use Docker, just build the backend.
  -h                   Show this help.

EOF
  exit 1
}

service_type="backend"
service_name="${service_type}"
container_name=
ignore_error=false
gradle_target="bootDistZip"
clean_build=false
wait_for_startup=false
no_docker=false

source "$(dirname "$0")/loader.sh" "$@"

while getopts "S:t:s:c:C:g:ifD?" option; do
  case "${option}" in
    S)
      # Scope is already read
      ;;
    i)
      ignore_error=true
      ;;
    f)
      clean_build=true
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
    C)
      compose_file=${OPTARG}
      ;;
    g)
      gradle_target=${OPTARG}
      ;;
    D)
      no_docker=true
      ;;
    ?)
      print_usage
      ;;
    *)
      ;;
  esac
done

if [ -z "$container_name" ]; then
  container_name="${application_name}-${service_name}"
fi

header "Restarting backend $service_name in container $container_name"

if [ "$debug" = true ]; then
  debug_print "Compose file:   $compose_file"
  debug_print "Service type:   $service_type"
  debug_print "Service name:   $service_name"
  debug_print "Container name: $container_name"
  debug_print "Ignore error:   $ignore_error"
  debug_print "Gradle target:  $gradle_target"
  debug_print "Clean build:    $clean_build"
  debug_print "No Docker:      $no_docker"
fi


colored_print "system" "## Building backend"
build_result=0
if [[ "${clean_build}" = true ]]; then
  colored_print "${service_type}" "Forced clean"
  ./gradlew clean | colored_output "${service_type}"
fi
./gradlew "${gradle_target}" 2>&1 | tee backend-build.log | colored_output "${service_type}"
if grep -q "BUILD FAILED" backend-build.log;
then
  build_result=42
fi
rm backend-build.log

if [ $build_result -ne 0 ];
then
  show_error "Backend build failed"
  if [ "$ignore_error" = true ]; then
    colored_print "system" "Backend build failed, but ignoring the error."
    build_result=0
  else
    build_result=42
  fi
else
  if [ "$no_docker" = true ]; then
    colored_print "system" "Skipping Docker build."
    exit 0
  else
    "$docker_cmd" compose -f "${compose_file}" -p "${application_name}" build "${service_name}"
    "$docker_cmd" compose -f "${compose_file}" -p "${application_name}" up --force-recreate -d "${service_name}"
  fi
fi

exit "$build_result"

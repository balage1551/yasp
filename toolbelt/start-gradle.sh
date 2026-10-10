#!/bin/bash
# shellcheck disable=SC2034

print_usage() {
  cat <<EOF

Usage: start-gradle.sh [-S <scope>]  [-t <service_type>] [-s <service_name>] [-g <gradle_target>] [-i] [-f] [-- <extra_args>]

Options:
  -S <scope>          The scope of the application. [Default: directory name]
  -t <service_type>    The type of the service to start. [Default: gradle]
  -s <service_name>    The name of the service to start. [Default: gradle]
  -g <gradle_target>   The Gradle target to build the backend. [Default: bootDistZip]
  -i                   Do not terminate on error.
  -f                   Force a clean build.
  -- <extra_args>      Extra arguments to pass to the Gradle task.

EOF
  exit 1
}

scope=
service_type="gradle"
service_name="${service_type}"
ignore_error=false
gradle_target="bootDistZip"
clean_build=false

while getopts "S:t:s:g:if?" option; do
  case "${option}" in
    S)
      scope=${OPTARG}
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
    g)
      gradle_target=${OPTARG}
      ;;
    ?)
      print_usage
      ;;
    *)
      ;;
  esac
done

shift $((OPTIND - 2))
extra_args=()
collecting_args=false

for arg in "$@"; do
  echo "arg: $arg   collecting_args: $collecting_args"
  if [ "$collecting_args" = true ]; then
    extra_args+=("$arg")
  elif [ "$arg" = "--" ]; then
    collecting_args=true
  fi
done


if [ -z "$core_loaded" ]; then
  source "$(dirname "$0")/core.sh" "$scope"
fi

header "Running gradle task ${gradle_target} for $service_name"

if [[ "$debug" = true ]]; then
  debug_print "Service type: $service_type"
  debug_print "Service name: $service_name"
  debug_print "Ignore error: $ignore_error"
  debug_print "Gradle target: $gradle_target"
  debug_print "Clean build: $clean_build"
  debug_print "Extra args: ${extra_args[*]}"
fi

build_result=0
if [[ "${clean_build}" = true ]]; then
  colored_print "${service_type}" "Forced clean"
  ./gradlew clean | colored_output "${service_type}"
fi

./gradlew "${gradle_target}" "${extra_args[@]}" 2>&1 | tee backend-build.log | colored_output "${service_type}"
if grep -q "BUILD FAILED" backend-build.log;
then
  build_result=42
fi
rm backend-build.log

if [ $build_result -ne 0 ];
then
  show_error "Backend build failed" false
  if [ "$ignore_error" = true ]; then
    colored_print "system" "Backend build failed, but ignoring the error."
    build_result=0
  fi
 fi

exit "$build_result"
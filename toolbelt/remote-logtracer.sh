#!/bin/bash
# shellcheck disable=SC2034

print_usage() {
  cat <<EOF

Usage: start-remote-log.sh [-S <scope>] [-t <service_type>] [-c <container_name>]

Options:
  -S <scope>                The scope of the application. [Default: directory name]
  -c <container_name>       Name of the docker container to poll. [Default: <scope>-app]
  -t <target_id>            The target id. [Default: staging]
  -h                        Show this help.

EOF
  exit 1
}

remote_server=
container_name=
target_id="staging"

source "$(dirname "$0")/loader.sh" "$@"

remote_user="$scope"

while getopts "S:t:" opt; do
  case $opt in
    S)
      # Scope is already read
      ;;
    t)
      target_id=${OPTARG}
      ;;
    *)
      # Do not bother with other options, they will be handled later
      ;;
  esac
done

config_dir="$(pwd)/toolbelt-deploy/${target_id}"
config_file="${config_dir}/.deploy-config"

if [ -e "$config_file" ]; then
  colored_print "deploy" "Loading configuration from $config_file"
  # shellcheck source=deploy-config/deploy-config.sh
  source "$config_file"
fi

OPTIND=1
while getopts "S:c:t:?" option; do
  case "${option}" in
    t)
      # Scope and target is already read
      ;;
    S)
      # Scope and target is already read
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


if [ -z "$container_name" ]; then
  container_name="${application_name}-app"
fi

header "Polling remote log  $container_name of $scope"

key_name="deploy-${target_id}-${scope}"

if [ "$debug" = true ]; then
  debug_print "Config dir:     $config_dir"
  debug_print "Container name: $container_name"
  debug_print "Remote server:  $remote_server"
  debug_print "Remote user:    $remote_user"
fi


if [ ! -e "${config_dir}/${key_name}" ]; then
  colored_print "deploy" "No key specified. Would you like to create a new key? [y/N]"
  read -r create_key
  if [[ "$create_key" =~ ^[Yy]$ ]]; then
    colored_print "deploy" "Creating new key: ${config_dir}/${key_name}"
    ssh-keygen -t ed25519 -f "${config_dir}/${key_name}" -N ""
    chmod 600 "${config_dir}/${key_name}"
    chmod 644 "${config_dir}/${key_name}.pub"
    echo "${key_name}*" >> "${config_dir}/.gitignore"
    colored_print "deploy" "Key created successfully. Would you like to install on the remote server? [y/N]"
    read -r install_key
    if [[ "$install_key" =~ ^[Yy]$ ]]; then
      colored_print "deploy" "Installing key on remote server: ${remote_user}@${remote_server}"
      ssh-copy-id -i "${config_dir}/${key_name}.pub" "${remote_user}@${remote_server}"
      if [ $? -eq 0 ]; then
        colored_print "deploy" "Key installed successfully."
      else
        show_error "Failed to install key on remote server."
        exit 1
      fi
    else
      colored_print "deploy" "Key installation skipped."
    fi
  else
    show_error "No key specified."
    exit 1
  fi
fi

server_url="${remote_user}@${remote_server}"

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
    colored_print "${target_id}" "$prefix$line"
  done
}

# Trap EXIT signal to ensure cleanup is called
trap cleanup EXIT

# Create a named pipe
pipe=$(mktemp -u -t "${container_name}-XXX.pipe")
mkfifo "$pipe"

# Start docker logs process and capture its PID
log_cmd="docker logs -f ${container_name}"
ssh -i "$config_dir/${key_name}" "$server_url" "$log_cmd" >"$pipe" &
docker_logs_pid=$!
colored_print "debug" "Started docker logs process $docker_logs_pid"

# Start the decorator in the background
decorate < "$pipe" &

# Wait for the docker logs process to finish
wait "$docker_logs_pid"

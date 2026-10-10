#!/bin/bash
# shellcheck disable=SC2034

print_usage() {
  cat <<EOF

Usage: start-deploy.sh [-S <scope>] [-t <service_type>] [-s <service_name>] [-c <container_name>] [-C <compose_file>] [-g <gradle_target>] [-i] [-f] [-w] [-h] [-D] [-F]

Options:
  -S <scope>                The scope of the application. [Default: directory name]
  -F                        Forced: clear lock on server before run. Use with caution.
  -t <target_id>            The target id. [Default: staging]
  -i                        Do not terminate on error.
  -h                        Show this help.

EOF
  exit 1
}

remote_server=
target_id="staging"
ignore_error=false
forced=false
packages=""
artifacts=""

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
while getopts "S:t:r:u:iF?" option; do
  case "${option}" in
    t)
      # Scope and target is already read
      ;;
    S)
      # Scope and target is already read
      ;;
    i)
      ignore_error=true
      ;;
    F)
      forced=true
      ;;
    r)
      remote_server=${OPTARG}
      ;;
    u)
      remote_user=${OPTARG}
      ;;
    ?)
      print_usage
      ;;
    *)
      ;;
  esac
done

header "Deploying $target_id of $scope"

key_name="deploy-${target_id}-${scope}"

if [ "$debug" = true ]; then
  debug_print "Config dir:     $config_dir"
  debug_print "Key name:       $key_name"
  debug_print "Remote server:  $remote_server"
  debug_print "Remote user:    $remote_user"
  debug_print "Ignore error:   $ignore_error"
  debug_print "Forced:         $forced"
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

if ssh -i "$config_dir/${key_name}" "$server_url" '[ -f ~/.deploy-lock ]'; then
  if [ "$forced" = true ]; then
    colored_print "deploy" "Clearing lock on remote server."
    ssh -i "$config_dir/${key_name}" "$server_url" 'rm -f ~/.deploy-lock';
  else
    colored_print "error" "A deployment is already in progress on the remote server. Please wait until it finishes or use -F option to clear lock. "
    exit 1
  fi
fi

ssh -i "$config_dir/${key_name}" "$server_url" 'echo "Deployment started at $(date)" > ~/.deploy-lock';

clear_lock() {
    ssh -i "$config_dir/${key_name}" "$server_url" 'rm -f ~/.deploy-lock'
}

deploy_temp_dir="$(pwd)/.deploy-temp"

mkdir -p "$deploy_temp_dir" || {
  show_error "Failed to create temporary directory: $deploy_temp_dir"
  clear_lock
  exit 1
}
rm -rf "${deploy_temp_dir:?}"/*

echo ""
colored_print deploy "Creating packages"

# Function to create the zip
create_zip() {
  local name="$1"
  shift
  local files=("$@")
  if [[ -n "$name" && ${#files[@]} -gt 0 ]]; then
    colored_print "deploy" "  Creating package ${name}.zip"
    local zip_name="$deploy_temp_dir/${name}.zip"
    zip -r "$zip_name" "${files[@]}" | while IFS= read -r line; do
      if [[ -n "$line" ]]; then
        colored_print "debug" "  $line"
      fi
    done
  fi
}

current_package=""
declare -a files

while IFS= read -r line; do
  line="${line#"${line%%[![:space:]]*}"}"
  line="${line%"${line##*[![:space:]]}"}"

  if [[ "$line" == *: ]]; then
    create_zip "$current_package" "${files[@]}"
    current_package="${line%:}"
    files=()
  elif [[ -n "$line" ]]; then
    # Use glob expansion manually
    # shellcheck disable=SC2206
    expanded=( $line )
    if [[ ${#expanded[@]} -eq 0 ]]; then
      echo "Warning: No files matched '$line'" >&2
    else
      files+=("${expanded[@]}")
    fi
  fi
done <<< "$packages"

# Final package flush
create_zip "$current_package" "${files[@]}"

colored_print "deploy" "Uploading packages to remote server"
for artifact in "${artifacts[@]}"; do
  # Trim whitespace
  artifact="${artifact#"${artifact%%[![:space:]]*}"}"
  artifact="${artifact%"${artifact##*[![:space:]]}"}"

  [[ -z "$artifact" ]] && continue

  if [[ "$artifact" == *:* ]]; then
    local_file="${artifact%%:*}"
    remote_dir="${artifact##*:}"
  else
    local_file="$artifact"
    remote_dir="deploy-temp"
  fi

  # Replace placeholders
  local_file="${local_file//\{temp\}/$deploy_temp_dir}"
  local_file="${local_file//\{config\}/$config_dir}"

  if [[ "$local_file" == @/* ]]; then
    real_path="$deploy_temp_dir/${local_file#@/}"
  else
    real_path="$local_file"
  fi

  if [[ ! -f "$real_path" ]]; then
    echo "⚠️  File not found: $real_path" >&2
    continue
  fi

  echo "📦 Uploading $local_file to $server_url:$remote_dir/"
  scp -i "$config_dir/$key_name" "$real_path" "$server_url:$remote_dir/"
done

colored_print "deploy" "Running update.sh on remote server"
ssh -i "$config_dir/${key_name}" "$server_url" 'bash ~/update.sh' 2>&1 | tee /tmp/update_output.log
update_output=$(cat /tmp/update_output.log)

if echo "$update_output" | grep -q "application.*Built"; then
  colored_print "deploy" "Update script completed successfully: application built."
else
  show_error "Update script did not report successful build."
  clear_lock
  exit 1
fi

clear_lock
exit 0

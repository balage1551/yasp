#!/bin/bash

toolbelt_dir=$(dirname "$(readlink -f "${BASH_SOURCE[0]}")")
root_dir=$(dirname "$toolbelt_dir")

if [ ! -f "./.callisto.drconfig" ]; then
  cp "${toolbelt_dir}/.runner.config.template" "./.callisto.drconfig"
fi

if [ -z "$core_loaded" ]; then
  source "$(dirname "$0")/core.sh" ""
fi

source ".runner-updater.config"

print_usage() {
  cat <<EOF
EOF
  exit "${1:0}"
}

current_version=$(cat "${toolbelt_dir}/.version")

command=$1
shift

check_remote_version() {
    local search_version=${1:-latest}

    command="sshpass -p \"${remote_password}\" ssh \"${remote_user}@${remote_host}\" \"ls release/\" | sort -V"

    if [[ "$search_version" == "latest" ]]; then
      command+=" | tail -1"
    else
      command+=" | grep \"^${search_version}$\""
    fi

    remote_version=$(eval "$command")

    if [ -z "$remote_version" ]; then
      colored_print "error" "Version $search_version not found"
      exit 1
    fi
}

printVersions() {
    check_remote_version "$1"

    colored_print "system" "Toolbelt version: $current_version"
    colored_print "system" "Remote version: $remote_version"
}

compare_versions() {
  local version1=$1
  local version2=$2

  if [[ "$version1" == "$version2" ]]; then
    echo "0"
  elif  [[ $(printf "%s\n%s" "$version1" "$version2" | sort -V | head -n 1) == "$version1" ]]; then
    echo "-1"
  else
    echo "1"
  fi
}


if [ -z "$command" ]; then
  print_usage 1
fi

if [[ "version" =~ ^${command} ]]; then
  colored_print "system" "Toolbelt version: $current_version"
  exit 0
fi

if [[ "check" =~ ^${command} ]]; then
  printVersions "$1"
  exit 0
fi


progress_bar() {
  local total=$1
  local current=$2
  local message=$3
  local width=60

  percentage=$((current * 100 / total))
  filled=$((percentage * width / 100))
  empty=$((width - filled))
  progress_bar=$(printf "%-${filled}s" "#" | tr ' ' '#')
  progress_bar+=$(printf "%-${empty}s" "-" | tr ' ' '-')
  printf "\r%3d%% |%s| %-50s" "$percentage" "$progress_bar" "$message"
}

if [[ "install" =~ ^${command} ]]; then
  forced=false

  while getopts "f" option; do
    case "${option}" in
      f)
        forced=true
        ;;
      ?)
        print_usage
        ;;
      *)
        colored_print "error" "Unknown option: $option"
        exit 1
        ;;
    esac
  done

  shift $((OPTIND - 1))
  requested_version=$1

  check_remote_version "$requested_version"
  colored_print "system" "Current version: $current_version"
  colored_print "system" "Requested version: $remote_version"

  if [ "${remote_version}" = "${current_version}" ] && [[ "$forced" = false ]]; then
    colored_print "#green" "Toolbelt is already at version $remote_version"
    exit 0
  fi

  if [[ $(printf "%s\n%s" "$remote_version" "$current_version" | sort -V | head -n 1) == "$remote_version" ]] && [[ "$forced" = false ]]; then
    colored_print "error" "Requested version is lower than the current current version. Use -f to force the installation."
    exit 2
  fi

  colored_print "system" "Downloading version $remote_version"
  colored_print "debug" "Creating temp directory"
  temp_dir="${toolbelt_dir}/temp-new-release"
  rm -Rf "$temp_dir"
  mkdir -p "$temp_dir"

  colored_print "debug" "Fetching file list"
  sshpass -p "${remote_password}" scp -r "${remote_user}@${remote_host}:release/${remote_version}/files.lst" "$temp_dir/"
  sshpass -p "${remote_password}" scp -r "${remote_user}@${remote_host}:release/${remote_version}/release-notes.md" "$temp_dir/${toolbelt_dir}/"

  colored_print "debug" "Downloading files"
  total_files=$(wc -l < "$temp_dir/files.lst")
  current_file=0
  while IFS= read -r file; do
    current_file=$((current_file + 1))
    progress_bar "$total_files" "$current_file" "$file"

    # Create the local directory structure
    mkdir -p "${temp_dir}/$(dirname "$file")"

    # Copy the file from the remote server
    sshpass -p "${remote_password}" scp "${remote_user}@${remote_host}:release/${remote_version}/${file}" "$temp_dir/$(dirname "$file")"
  done < "$temp_dir/files.lst"

  echo -ne "\r\033[K"

  colored_print "debug" "Copying files to the toolbelt directory"
  mv "$temp_dir/files.lst" "${toolbelt_dir}/files.lst"
  cp -r "$temp_dir"/* "$root_dir"/

  colored_print "debug" "Finalizing installation"
  echo "$remote_version" > "${toolbelt_dir}/.version"
  rm -R "$temp_dir"

#  sshpass -p "${remote_password}" scp -r "${remote_user}@${remote_host}:release/${remote_version}/toolbelt" "${toolbelt_dir}/../"
  colored_print "system" "Toolbelt updated to version $remote_version"

  exit 0
fi

upload_file() {
  local file=$1
  local remote_dir=$2

  if [ -n "$remote_dir" ]; then
    remote_dir="$remote_dir/"
  fi

  current_file=$((current_file + 1))
  progress_bar "$total_files" "$current_file" "$file"
  sshpass -p "${remote_password}" scp "$file" "${remote_user}@${remote_host}:${temp_remote_dir}/$remote_dir"
}

if [[ "release" =~ ^${command} ]]; then
  new_version=$1

  # Check if version is in the correct format
  if [[ ! "$new_version" =~ ^[0-9]+\.[0-9]+\.[0-9]+$ ]]; then
    colored_print "error" "Version format is incorrect. Use <major>.<minor>.<patch>"
    exit 1
  fi

  check_remote_version
  check=$(compare_versions "$remote_version" "$new_version")
  if [ "$check" -ne -1 ]; then
    colored_print "error" "Version $new_version should be higher than the current version $remote_version"
    exit 1
  fi

  # Create the release directory on the server
  colored_print "debug" "Creating temporal directory on server"
  temp_remote_dir="release-temp"
  sshpass -p "${remote_password}" ssh "${remote_user}@${remote_host}" "rm -R ${temp_remote_dir} 2>/dev/null"
  sshpass -p "${remote_password}" ssh "${remote_user}@${remote_host}" "mkdir -p ${temp_remote_dir}"

  mkdir_commands=$(awk -v base="$temp_remote_dir" '{print base "/" $0}' "${toolbelt_dir}/files.lst" \
      | xargs -n1 dirname \
      | sort -u \
      | awk '{print "mkdir -p " $0 }' \
      | tr '\n' ';')


  sshpass -p "${remote_password}" ssh "${remote_user}@${remote_host}" "$mkdir_commands"

  colored_print "debug" "Uploading files"
  total_files=$(wc -l < "${toolbelt_dir}/files.lst")
  total_files=$((total_files + 2))
  current_file=0
  while IFS= read -r file; do
    upload_file "$file" "$(dirname "$file")"
  done < "${toolbelt_dir}/files.lst"

  upload_file "${toolbelt_dir}/files.lst"
  if [ -f "${toolbelt_dir}/release-notes.md" ]; then
    upload_file "${toolbelt_dir}/release-notes.md"
  fi

  echo -ne "\r\033[K"

  colored_print "debug" "Finalizing release"
  sshpass -p "${remote_password}" ssh "${remote_user}@${remote_host}" "mv ${temp_remote_dir} release/${new_version}"
  echo "$new_version" > "${toolbelt_dir}/.version"

  colored_print "system" "Release $new_version created"
fi


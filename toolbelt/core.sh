# shellcheck disable=SC2034

# Function: process_default_options
# Description: Processes the default options (then resets the OPTIND)
# Parameters: options
# Returns: unprocessed options
process_default_options() {
  interactive_start=${interactive_start:-false}
  unprocessed_options=()

  while getopts ":i" option; do
    case "${option}" in
      i)
        interactive_start=true
        ;;
      *)
        unprocessed_options+=( "-$OPTARG" ) # add to pass-through array
        # shellcheck disable=SC2199
        if [[ ${@: OPTIND:1} != -* ]]; then
          unprocessed_options+=( "${@: OPTIND:1}" )
          (( ++OPTIND ))
        fi
        ;;
    esac
  done

  # Collect unprocessed options
 shift $((OPTIND - 1))
 unprocessed_options+=( "$@" )  # append remaining args. (operands), if any

  # Reset OPTIND
  OPTIND=1

}

process_default_options "$@"

scope=${unprocessed_options[0]:-$(basename "$PWD")}

toolbelt_dir=$(dirname "$(readlink -f "${BASH_SOURCE[0]}")")

# Function: debug_print
# Description: Prints a debug message if debug mode is enabled
# Arguments:
#   $1: The message to print
# Returns: None
debug_print() {
  if [ "$debug" = true ]; then
    colored_print "debug" "$1"
  fi
}


# Function: read_config
# Description: Reads the configuration file
# Arguments: None
# Returns: None
read_config() {
  local config_file
  config_file=".${scope}.drconfig"
  if [ -f "./${config_file}" ]; then
    # shellcheck source=./.naboo.drconfig
    source "./${config_file}"
    if [ "$debug" = true ]; then
      colored_print "debug" "Configuration file '${config_file}' loaded"
    fi
  else
    show_error "Error: Configuration file '$config_file' not found." true
  fi

  # Check if application_name is defined
  if [ -z "$application_name" ]; then
    # Get the current directory name (last segment)
    application_name=$(basename "$PWD")
  fi

  compose_file="${compose_file:-"docker-compose-local.yml"}"
}

# Function: get_color
# Description: Get the color escape code for a color name if using color is enabled
# Arguments:
#   $1: The color name
# Returns:
#   The color escape code or empty
get_color() {
  local color_key=""
  local attributes=""

  # Split color_value by comma
  if [[ "$1" == \#* ]]; then
    IFS=',' read -r color_key attributes_list <<< "${1:1}"
  else
    local color_variable="${1}_color"
    local color_value="${!color_variable}"
    IFS=',' read -r color_key attributes_list <<< "$color_value"
  fi

  # Convert color name to lowercase
  local lowercase
  lowercase=$(echo "$color_key" | tr '[:upper:]' '[:lower:]')
  case "$lowercase" in
    "black")
      color_key="30"
      ;;
    "red")
      color_key="31"
      ;;
    "green")
      color_key="32"
      ;;
    "yellow")
      color_key="33"
      ;;
    "blue")
      color_key="34"
      ;;
    "magenta")
      color_key="35"
      ;;
    "cyan")
      color_key="36"
      ;;
    "light_gray")
      color_key="37"
      ;;
    "gray")
      color_key="90"
      ;;
    "light_red")
      color_key="91"
      ;;
    "light_green")
      color_key="92"
      ;;
    "light_yellow")
      color_key="93"
      ;;
    "light_blue")
      color_key="94"
      ;;
    "light_magenta")
      color_key="95"
      ;;
    "light_cyan")
      color_key="96"
      ;;
    "white")
      color_key="97"
      ;;
    *)
      color_key=""
      ;;
  esac

  # Process attributes
  if [ -n "$attributes_list" ]; then
    IFS=',' read -ra attributes_array <<< "$attributes_list"
    for attribute in "${attributes_array[@]}"; do
      case "$attribute" in
        "bold")
          attributes="${attributes};1"
          ;;
        "faint")
          attributes="${attributes};2"
          ;;
        "italic")
          attributes="${attributes};3"
          ;;
        "underlined")
          attributes="${attributes};4"
          ;;
      esac
    done
  fi

  # Remove leading semicolon
  attributes="${attributes#;}"

  local color_code=""
  if [ -n "${color_key}" ] && [ "${use_colors:-false}" = true ]; then
    color_code="\033[${color_key}${attributes:+;${attributes}}m"
  fi

  echo "$color_code"
}



declare -A colors

# Function: colored_print
# Description: Print a message in a specific color
# Arguments:
#   $1: The color code
#   $2: The message to print
#   $3: Do not close color (default: false)
#   $4: Do not add enter (default: false)
# Returns: None
colored_print() {
  local color_class=$1
  local message=$2
  local do_not_close_color=$3
  local do_not_add_enter=$4
  local close_code
  local color_code

  if [ "$use_colors" = true ]; then
    if [[ -v colors["$color_class"] ]]; then
      color_code=${colors[$color_class]}
    else
      color_code=$(get_color "$color_class")
      colors[$color_class]=$color_code
    fi
    if [ "$do_not_close_color" != true ]; then
      close_code="\033[0m"
    fi
    echo -en "${color_code}"
    echo -n "${message}"
    echo -en "${close_code}"
    if [ "$do_not_add_enter" != true ]; then
      echo ""
    fi
  else
    echo "$message"
  fi
}

colored_output() {
  local service_type=$1

  while IFS= read -r line; do
    colored_print "$service_type" "$line"
  done
}


# Function: header
# Description: Displays a header message
# Parameters:
#   $1 - The message to display
# Returns: None
header() {
  local message=$1
  colored_print "system" ""
  colored_print "system" "=============================================================================================="
  colored_print "system" "== $message"
  colored_print "system" "=============================================================================================="
}


# Function: show_error
# Description: Displays an error message and optionally terminates the script
# Parameters:
#   $1 - The error message (default: "")
#   $2 - Forced terminate on failure (default: false)
# Returns: None
show_error() {
  local error=$1
  local forced_terminate_on_failure=${2:-false}

  if [ -n "$error" ]; then
    local padding=3
    local total_length=$(( ${#error} + 2 * padding + 4 ))
    local border
    border=$(printf '#%.0s' $(seq 1 $total_length))

     echo ""
     colored_print "error" "$border" true
     printf "##%*s%s%*s##\n" $padding "" "$error" $padding ""
     colored_print "error" "$border"
     echo ""
  fi

  if [[ "${terminate_on_failure:-false}" = true ]] || [[ "$forced_terminate_on_failure" = true ]]; then
    terminate
  fi
}



# Function: is_running
# Description: Checks if the docker services are running
# Parameters: None
# Returns: 0 if the services are running, 1 otherwise
is_running() {
  # Get the status of all containers
  local status
  status=$("$docker_cmd" compose -f "${compose_file}" -p "${application_name}" ps -q)

  if [ -n "$status" ]; then
    return 0
  else
    return 1
  fi
}


# Function: start_docker
# Description: Starts the docker services
# Parameters: None
# Returns: None
stop_docker() {
  if is_running; then
    colored_print "system" "Stopping running containers on '$application_name'"
    "$docker_cmd" compose -p "${application_name}" down
    wait
  fi
}



# Function: terminate
# Description: Terminates the script and stops all services
# Parameters: None
# Returns: None
terminate() {
  stop_docker
  exit 42
}


# Function: wait_for_container
# Description: Wait for a container to stop and stream the logs
# Parameters:
#   $1 - The service type
#   $2 - The container name
#   $3 - Quiet mode (default: false)
# Returns: The exit code of the container
wait_for_container() {
  local service_type=$1
  local container_key=$2
  local quiet=$3

  # Get the container ID of the Flyway container
  local container_id
  container_id=$("$docker_cmd" ps -q -f "name=${container_key}")

  # Stream the Flyway container logs
  if [[ "$quiet" != true ]]; then
    "$docker_cmd" logs -f "$container_id" > >(while read -r line; do
      colored_print "${service_type}" "$line"
    done) &
  fi

  # Wait for the Flyway container to stop
  "$docker_cmd" wait "$container_id"

  # Get the exit code of the Flyway container
  local exit_code
  exit_code=$("$docker_cmd" inspect "$container_id" --format='{{.State.ExitCode}}')

  return "$exit_code"
}

# Function: start_database
# Description: Starts the database service with the current scope
# Parameters:
#   $@ - Command arguments (see toolbelt/start-database.sh -h for details)
# Returns: The exit code of the start-database script
start_database() {
  "$toolbelt_dir/start-database.sh" -S "$scope" "$@"
  return $?
}

# Function: start_gradle
# Description: Starts the gradle service with the current scope
# Parameters:
#   $@ - Command arguments (see toolbelt/start-gradle.sh -h for details)
# Returns: The exit code of the start-gradle script
start_gradle() {
  "$toolbelt_dir/start-gradle.sh" -S "$scope" "$@"
  return $?
}

# Function: start_flyway
# Description: Starts the flyway service with the current scope
# Parameters:
#   $@ - Command arguments (see toolbelt/start-flyway.sh -h for details)
# Returns: The exit code of the start-flyway script
start_flyway() {
  "$toolbelt_dir/start-flyway.sh" -S "$scope" "$@"
  return $?
}

# Function: start_frontend
# Description: Starts the frontend service with the current scope
# Parameters:
#   $@ - Command arguments (see toolbelt/start-frontend.sh -h for details)
# Returns: The exit code of the start-frontend script
start_frontend() {
  "$toolbelt_dir/start-frontend.sh" -S "$scope" "$@"
  return $?
}

# Function: start_backend
# Description: Starts the backend service with the current scope
# Parameters:
#   $@ - Command arguments (see toolbelt/start-backend.sh -h for details)
# Returns: The exit code of the start-backend script
start_backend() {
  "$toolbelt_dir/start-backend.sh" -S "$scope" "$@"
  return $?
}

# Function: start_deployment
# Description: Starts the deployment
# Parameters:
#   $@ - Command arguments (see toolbelt/start-deploy.sh -h for details)
# Returns: The exit code of the start-deploy script
start_deploy() {
  "$toolbelt_dir/start-deploy.sh" -S "$scope" "$@"
  return $?
}




declare -A action_descriptions
declare -A action_loggers
declare -A action_key
declare -A action_commands

# Function: add_action
# Description: Adds an action to the list
# Arguments:
#   $1: The name of the action
#   $2: The key of the action
#   $3: The description of the action
#   $4: The logger key
#   $@: The command and its arguments
# Returns: 1 if the action already exists, 0 otherwise
add_action() {
  local name=$1
  local key=$2
  local description=$3
  local logger=$4
  local command=("${@:5}")

  # Check if the name already exists in the array
  if [[ -n "${action_key[$name]}" ]]; then
    colored_print "error" "Error: '$name' already exists as action name."
    return 1
  fi

  action_descriptions[$name]=$description
  action_loggers[$name]=$logger
  action_key[$name]=$key
  action_commands[$name]="${command[*]}"

  return 0
}


# Function: remove_action
# Description: Removes an action from the list
# Arguments:
#   $1: The name of the action
# Returns: None
remove_action() {
  local name=$1

  unset "action_descriptions[$name]"
  unset "action_loggers[$name]"
  unset "action_key[$name]"
  unset "action_commands[$name]"
}


# Function: register_action
# Description: Registers an action with additional options
# Arguments:
#   $1: The name (special names: @help, @quit)
#   -k <key>: The key (optional)
#   -d <description>: The description (optional)
#   -l <logger_key>: The logger key (optional)
#   -a: Auto start the logger (optional)
#   $@: The command and its arguments
# Returns: None
register_action() {
  local name=$1
  shift

  if [ "$name" == "@help" ]; then
    add_action "help" "h" "Shows this help" "" "echo \"\""
    return
  fi

  if [ "$name" == "@quit" ]; then
    add_action "quit" "q" "Quit" "" "clean_up"
    return
  fi

  local key=""
  local description=""
  local logger_key=""
  local command=()


  while [[ $# -gt 0 ]]; do
    case $1 in
      -d)
        description=$2
        shift 2
        ;;
      -l)
        logger_key=$2
        shift 2
        ;;
      -k)
        key=$2
        shift 2
        ;;
      *)
        command+=("$1")
        shift
        ;;
    esac
  done


  add_action "$name" "$key" "$description" "$logger_key" "${command[@]}"
}


# Function: list_actions
# Description: Lists all registered actions in a structured format
# Arguments: None
# Returns: None
list_actions() {
  for name in "${!action_descriptions[@]}"; do
    echo "== $name (${action_key[$name]})"
    echo "   desc: ${action_descriptions[$name]}"
    echo "   logger: ${action_loggers[$name]}"
    echo "   command: ${action_commands[$name]}"
  done
}


# Function: execute_command
# Description: Runs a command, waits for it to complete, and checks the exit code
# Arguments:
#   $@: The command to run
# Returns: command exit code
execute_command() {
  while true; do
    # Executes the command
    debug_print "Command to execute: $*"
    "$@"

    # Capture the exit code
    local exit_code=$?

    # Check the exit code
    if [ $exit_code -eq 42 ]; then
      echo
      colored_print "system" "Do you want to terminate (Q), ignore (i) or rerun (r) action? [Q/r/i] " false true
      read -r -n 1 -s key
      echo ""
      case "$key" in
        "" | "Q" | "q")
          clean_up
          ;;
        "r" | "R")
          ;;
        "i" | "I")
          break
          ;;
        "h" | "H")
          colored_print "system" "Invalid option. Please choose:"
          colored_print "system" "   q : stop all services and quit"
          colored_print "system" "   i : ignore error and proceed"
          colored_print "system" "   r : execute action again"
          ;;
      esac
    else
      # If the exit code is not 42, break the loop
      break
    fi
  done
}


# Function: run_action
# Description: Runs an action based on the name
# Parameters:
#   $1 - The name
#   $2 - The condition variable (default: "") If provided and the variable is false, the action will not be executed
# Returns: None
run_action() {
  local name=$1
  local condition_field=$2

  # Check if the name exists in the array
  if [[ -z "${action_commands[$name]}" ]]; then
    show_error "'$name' is not a valid action name."
    terminate
  fi

  if [ -z "$condition_field" ] || [[ "${!condition_field:-false}" = true ]]; then
  if [[ "$interactive_start" = true ]]; then
    while true; do
      echo
      colored_print "system" "Do you want to run action $name? [Y/n/a/q/s] " false true
      read -r -n 1 -s key
      echo ""
      case "$key" in
        "" | "Y" | "y")
          break
          ;;
        "n" | "N")
          colored_print "system" "Skipping action ${name}."
          return
          ;;
        "a" | "A")
          interactive_start=false
          break
          ;;
        "q" | "Q")
          colored_print "system" "Exiting, but keeping the running services up."
          exit
          ;;
        "s" | "S")
          clean_up
          ;;
        *)
          colored_print "system" "Invalid option. Please choose:"
          colored_print "system" "   y : execute action"
          colored_print "system" "   n : skip action"
          colored_print "system" "   a : execute action and do not ask again"
          colored_print "system" "   q : quit (keep services running)"
          colored_print "system" "   s : stop all services and quit"
          ;;
      esac
    done
  fi
    # Execute the command
    local logger=${action_loggers[$name]}
    local logger_running=1
    if [ -n "$logger" ]; then
      is_logger_running "$logger"
      logger_running=$?
      toggle_logger "$logger" "stop"
    fi
    execute_command eval "${action_commands[$name]}"
    if [ -n "$logger" ] && [ $logger_running -eq 0 ]; then
      toggle_logger "$logger" "start"
    fi
  else
    debug_print "Condition not met for action $name ($condition_field=${!condition_field})"
  fi
}


declare -A logger_definitions
declare -A logger_pids

# Function: register_logger
# Description: Registers a logger
# Parameters:
#   $1 - The name of the logger
#   -t <service_type> - The type of the service
#   -s <service_key> - The key of the service
#   -c <container_key> - The key of the container
#   -p - Prefix the log messages with the service name
#   -P - Do not prefix the log messages
#   -g <filter> - Only show log lines matching this extended-regex filter (must not contain ':')
# Returns: None
register_logger () {
  local name=$1
  shift

  local service_type=""
  local service_key="$name"
  local container_key=""
  local prefix="*"
  local is_remote="0"
  local filter=""

  while [[ $# -gt 0 ]]; do
    case $1 in
      -t)
        service_type=$2
        shift 2
        ;;
      -s)
        service_key=$2
        shift 2
        ;;
      -c)
        container_key=$2
        shift 2
        ;;
      -p)
        prefix=$2
        shift 2
        ;;
      -P)
        prefix=""
        shift
        ;;
      -g)
        filter=$2
        shift 2
        ;;
      -R)
        is_remote="1"
        shift
        ;;
      *)
        colored_print "error" "Invalid argument: $1"
        shift
        ;;
    esac
  done

  if [ -z "$service_type" ]; then
    service_type="${service_key%%-*}"
  fi

  if [ -z "$container_key" ]; then
    container_key="${application_name}-${service_key}"
  fi

  if [ "$prefix" = "*" ]; then
    prefix="$service_key"
  fi

  # filter is kept last because it may be empty; it must not contain ':' (the field separator).
  logger_definitions[$name]="$is_remote:$service_type:$service_key:$container_key:$prefix:$filter"

  colored_print "system" "Registering logger '$name' for ${logger_definitions[$name]}"

}



# Function: is_logger_running
# Description: Checks if a logger is running
# Parameters:
#   $1 - The logger name
# Returns: 0 if the logger is running, 1 otherwise
is_logger_running() {
  local name=$1
  local pid=${logger_pids[$name]}
  if [ -n "$pid" ]; then
    return 0
  else
    return 1
  fi
}


# Function: toggle_logger
# Description: Toggles log tracing for a component
# Parameters:
#   $1 - The logger name
#   $2 - Mode (start/stop/toggle)
# Returns: None
toggle_logger() {
  local name=$1
  local mode=${2:-toggle}
  local is_remote=0
  local service_type=""
  local service_key=""
  local container_key=""
  local prefix=""
  local filter=""

  if [ -z "${logger_definitions[$name]}" ]; then
    show_error "Error: Logger definition not found for '$name'."
    terminate
  fi

  local component_info=${logger_definitions[$name]}

  debug_print "Component info: $component_info"

  IFS=':' read -r is_remote service_type service_key container_key prefix filter <<< "$component_info"

  echo "is_remote: ${is_remote}   container_key: $container_key"

  local pid=${logger_pids[$name]}
  if [ -z "$pid" ]; then
    if [ "$mode" == "stop" ]; then
      return 0
    fi
    colored_print "system" "Starting log tracing for component $name on '$container_key'"
    # TODO pass the prefix not only a flag
    if [[ "$is_remote" == "1" ]]; then
      colored_print "system" "Starting remote log polling on $container_key"
      # "$([ -n "$prefix" ] && echo "-p")"
      "${toolbelt_dir}/remote-logtracer.sh" "-S" "$scope"  &
    else
      "${toolbelt_dir}/logtracer.sh" "-S" "$scope" "-s" "$service_key" "-t" "$service_type" "-c" "$container_key" ${filter:+-g "$filter"} "$([ -n "$prefix" ] && echo "-p")" &
    fi
    logger_pids["$name"]=$!
  else
    if [ "$mode" == "start" ]; then
      return 0
    fi
    colored_print "system" "Stopping log tracing for component '$name' $pid"
    kill -TERM "$pid"
    unset "logger_pids[$name]"
    sleep 1
  fi
}


# Function: clean_up
# Description: Cleans up the script and stops all services
# Parameters: None
# Returns: None
clean_up() {
  header "Cleaning up"
  terminate
}


# Function: show_help
# Description: Displays the help menu
# Parameters: None
# Returns: None
show_help() {
  echo ""
  colored_print "system" "== State =="
  colored_print "system" "  Application name: $application_name"
  colored_print "system" "  Terminate on error: ${terminate_on_failure:-false}"
  echo ""
  colored_print "system" "== Available loggers =="
  for name in $(echo "${!logger_definitions[@]}" | tr ' ' '\n' | sort); do
    colored_print "system" "  $name " false true
    local running=""
    if is_logger_running "$name"; then
      colored_print "#green,italic" "  running   " false true
    else
      colored_print "#white,italic" "  stopped   " false true
    fi
    colored_print "debug" "[${logger_definitions[$name]}]"
  done

  echo ""
  colored_print "system" "== Available actions =="
  local entry
  for entry in $(for name in "${!action_key[@]}"; do
    [[ -n "${action_key[$name]}" ]] && echo "${action_key[$name]}|$name"
  done | LC_ALL=C sort); do
    key="${entry%%|*}"
    name="${entry#*|}"
    description="${action_descriptions[$name]}"
    colored_print "system" "  $key - $description " false true
    colored_print "debug" "[$name]"
  done
  echo ""
}


# Function: listen
# Description: Listens for user input and executes the corresponding action
# Parameters: None
# Returns: None
listen() {
  trap clean_up SIGINT SIGTERM

  interactive_start=false

  show_help
  while :; do
    read -rt 1 -n 1 key
    if [[ -z $key ]]; then
      continue
    fi
    echo ""

    # Find the action name by key
    local name=""
    for n in "${!action_key[@]}"; do
      if [[ "${action_key[$n]}" == "$key" ]]; then
        name="$n"
        break
      fi
    done

    if [ -z "$name" ]; then
      colored_print "error" "Invalid key: $key"
      show_help
      continue
    fi

    run_action "$name"
    show_help

  done
}

read_config
docker_cmd=${docker_cmd:-docker}

debug_print "Toolbelt directory: $toolbelt_dir"
debug_print "Docker command: $docker_cmd"

core_loaded=true


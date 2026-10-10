#!/bin/bash
#
# Local development: backend and Vite dev server in docker (docker-compose-local.yml).
# Run it from the repository root; press h for the available actions.

# Both containers run as the host user (see docker-compose-local.yml).
HOST_UID=$(id -u)
HOST_GID=$(id -g)
export HOST_UID HOST_GID

if [ ! -f ./.yasp.drconfig ]; then
  cp ./.yasp.drconfig.template ./.yasp.drconfig
  echo "Created .yasp.drconfig from the template."
fi

source "./toolbelt/core.sh"

# Stop the running containers
stop_docker

# Registering loggers
register_logger "backend"
register_logger "frontend"

# Registering actions
register_action "rebuild-backend" -k "b" -d "Build backend" -l "backend" start_backend -C docker-compose-local.yml -g :backend:bootJar
register_action "rebuild-backend-forced" -k "B" -d "Build backend (forced)" -l "backend" start_backend -C docker-compose-local.yml -g :backend:bootJar -f
register_action "start-frontend" -k "F" -d "Restart frontend" -l "frontend" start_frontend
register_action "toggle-backend-logger" -k "1" -d "Toggle backend logger" toggle_logger "backend" "toggle"
register_action "toggle-frontend-logger" -k "2" -d "Toggle frontend logger" toggle_logger "frontend" "toggle"
register_action "@help"
register_action "@quit"

# Start common services
run_action "rebuild-backend"
run_action "start-frontend"
run_action "toggle-frontend-logger" "start_frontend_logger"
run_action "toggle-backend-logger" "start_backend_logger"

# Start the washing machine
listen

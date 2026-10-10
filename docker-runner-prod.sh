#!/bin/bash
#
# Production: builds the war (frontend included) on this machine and deploys it to the server
# (toolbelt-deploy/prod/.deploy-config), where toolbelt-deploy/common-scripts/update.sh rebuilds
# the image and restarts docker-compose-prod.yml. Nothing runs locally.

if [ ! -f ./.yasp.drconfig ]; then
  cp ./.yasp.drconfig.template ./.yasp.drconfig
  echo "Created .yasp.drconfig from the template."
fi

source "./toolbelt/core.sh"

target_id="prod"

# The toolbelt's remote logger always reads the default (staging) deploy target, so the log of
# prod is followed by hand.
toggle_remote_logger() {
  if [ -n "$remote_logger_pid" ]; then
    colored_print "system" "Stopping the remote log"
    kill -TERM "$remote_logger_pid"
    remote_logger_pid=
  else
    "${toolbelt_dir}/remote-logtracer.sh" -S "$scope" -t "$target_id" &
    remote_logger_pid=$!
  fi
}

# The containers of this compose project run on the server; quitting must not take down a local
# development stack of the same name, only the log follower.
stop_docker() {
  if [ -n "$remote_logger_pid" ]; then
    toggle_remote_logger
  fi
}

# Registering actions
register_action "build-app" -k "b" -d "Build application" start_backend -s application -C docker-compose-prod.yml -g :backend:bootWar -D
register_action "deploy-app" -k "D" -d "Deploy application to the server" start_deploy -t "$target_id"
register_action "toggle-remote-logger" -k "l" -d "Toggle remote logger" toggle_remote_logger
register_action "@help"
register_action "@quit"

## Start the washing machine
listen

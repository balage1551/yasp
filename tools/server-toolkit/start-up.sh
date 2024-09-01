#!/bin/bash

source ./.app-config

APP_COMMAND="nohup ${APP_START} 2>&1 >${APP_LOG} &"
IS_RUNNING_SCRIPT="./is-running.sh"

pid=$($IS_RUNNING_SCRIPT)

if [ -n "$pid" ]; then
    echo "${APP_NAME} is already running with PID $pid."
else
    # Start the application
    echo "Starting ${APP_NAME}..."
    source "$HOME/.sdkman/bin/sdkman-init.sh"
    eval $APP_COMMAND

    # Wait for a moment to ensure the application has started
    sleep 2

    # Check if the application is running
    pid=$($IS_RUNNING_SCRIPT)

    if [ -n "$pid" ]; then
        echo "Application is running with PID $pid."
    else
        echo "Failed to start the application."
    fi
fi

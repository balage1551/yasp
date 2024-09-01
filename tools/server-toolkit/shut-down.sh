#!/bin/bash

source .app-config

IS_RUNNING_SCRIPT="./is-running.sh"

for ((i=1; i<=10; i++)); do
    pid=$($IS_RUNNING_SCRIPT)
    
    if [ -n "$pid" ]; then
        echo "Stopping $APP_NAME (attempt $i) with PID $pid..."
        kill $pid

        # Wait for 1 second
        sleep 1

        # Check if the process is still running
        pid=$($IS_RUNNING_SCRIPT)
        if [ -n "$pid" ]; then
            # If still running after 10 attempts, force kill with -9
            if [ $i -eq 10 ]; then
                echo "Force killing $APP_NAME with PID $pid..."
                kill -9 $pid
            fi
        else
            echo "$APP_NAME stopped successfully."
            break
        fi
    else
        echo "$APP_NAME is not running."
        break
    fi
done

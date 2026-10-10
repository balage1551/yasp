#!/bin/bash

source "./toolbelt/core.sh"

colored_print "system" "Application name: $application_name"
colored_print "system" "Scope:            $scope"
colored_print "system" "Compose file:     $compose_file"


# Stop the running containers
colored_print "system" "Stopping services..."
stop_docker

colored_print "system" "Starting services..."
"$docker_cmd" compose -f "${compose_file}" -p "${application_name}" up --force-recreate -d application

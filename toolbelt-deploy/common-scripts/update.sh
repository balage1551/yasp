#!/bin/bash
#
# Runs on the server after an upload (toolbelt/start-deploy.sh): rebuilds the application image
# from the uploaded war and restarts the stack. gallery/ holds the slideshows, it is never
# touched by a deploy.

# Initializing environment
mkdir -p application deploy-temp gallery

echo "Unpacking toolbelt..."
unzip -o ./deploy-temp/toolbelt.zip

source "./toolbelt/core.sh"

colored_print "system" "Application name: $application_name"
colored_print "system" "Scope:            $scope"
colored_print "system" "Compose file:     $compose_file"


build_application_image() {
  if "$docker_cmd" compose -f "${compose_file}" -p "${application_name}" build application; then
    echo "Application image built successfully."
    exit 0
  else
    echo "Application image build failed."
    exit 1
  fi
}

# The image is built while the old version still runs, so a failed build leaves it running.
colored_print "system" "Rebuild application docker..."
built_successfully=false
while IFS= read -r line; do
  colored_print "deploy" "| $line"
  if [[ $line =~ Application\ image\ built\ successfully ]]; then
    built_successfully=true
  fi
done < <(build_application_image 2>&1)

if $built_successfully; then
  colored_print "system" "Application image built successfully."
  ./startup.sh
else
  show_error "Application image build failed or did not complete as expected."
  exit 1
fi


read_scope() {
  local params=("$@")
  local next_is_value=false

  for param in "${params[@]}"; do
    if [ "$next_is_value" = true ]; then
      scope="$param"
      break
    fi

    if [ "$param" = "-S" ]; then
      next_is_value=true
    fi
  done
}

if [ -z "$core_loaded" ]; then
  read_scope "$@"
  source "$(dirname "$0")/core.sh" "$scope"
fi
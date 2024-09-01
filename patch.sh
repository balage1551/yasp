#!/bin/bash

if [ "$#" -ne 4 ]; then
  echo "Usage: patch.sh <old-prj-name> <old-db-password> <new-prj-name> <new-db-password>." >&2
  exit 1
fi

rm -rf backup new
mkdir -p backup
mkdir -p new

oldName=$1
oldPwd=$2
newName=$3
newPwd=$4
oldNameLower="${oldName,,}"
oldNameUpper="${oldName^^}"
oldNameCapital="$(echo "$oldName" | awk '{print toupper(substr($0,1,1)) tolower(substr($0,2))}')"
newNameLower="${newName,,}"
newNameUpper="${newName^^}"
newNameCapital="$(echo "$newName" | awk '{print toupper(substr($0,1,1)) tolower(substr($0,2))}')"

while true; do
  # Print a prompt
  echo "WARNING: This script will replace all occurrences of '$oldNameLower' to '$newNameLower' in directory $(pwd) and all its subdirectories."
  echo -n "Do you want to continue? (Y/N):"

  # Read user input
  read -n 1 response

  # If the input is empty, default to 'N'
  if [ -z "$response" ]; then
    response="N"
  fi

  # Convert the input to uppercase for case-insensitive comparison
  response=$(echo "$response" | tr '[:lower:]' '[:upper:]')

  # Check if the response is 'Y' or 'N'
  if [[ "$response" == "Y" || "$response" == "N" ]]; then
    echo
    break  # Exit the loop if the response is valid
  else
    printf "\nInvalid input. Please enter Y or N.\n"
  fi
done

if [[ "$response" == "N" ]]; then
    exit 2
fi

file_list=$(grep -ERi "(${oldNameLower}|${oldPwd})" | grep -Ev "(package|import)" | gawk  'BEGIN { FS=":" } { print $1 }' | uniq)

if [ -z "$file_list" ]; then
  echo "Nothing to do."
  exit 0
fi

while read -r file_name; do
  echo "Processing file: $file_name"

  # Backup
  directory_only=$(dirname "$file_name")
  mkdir -p "backup/${directory_only}"
  mkdir -p "new/${directory_only}"
  cp "${file_name}" "backup/${file_name}"

  sed -i \
      -e "s/${oldNameLower}/${newNameLower}/g" \
      -e "s/${oldNameUpper}/${newNameUpper}/g" \
      -e "s/${oldNameCapital}/${newNameCapital}/g" \
      -e "s/${oldPwd}/${newPwd}/g" \
      "${file_name}"

  # Add your logic here, such as processing the file or running commands on it
done <<< "$file_list"


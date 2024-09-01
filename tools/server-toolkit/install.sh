SCRIPT_PATH="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
cd $SCRIPT_PATH

source ./.app-config

IS_RUNNING_SCRIPT="./is-running.sh"

pid=$($IS_RUNNING_SCRIPT)

if [ -n "$pid" ]; then
    echo "Stopping ${APP_NAME} running on PID ${pid}."
    ./shut-down.sh
fi

echo "Backuping old version"
rm -Rf old
mkdir old
mv bin old/
mv lib old/

echo "Unpacking distribution ${RELEASE_ZIP}..."
unzip -q "${RELEASE_ZIP}"
mv ${RELEASE_BASE_NAME}/* .
rmdir ${RELEASE_BASE_NAME}
chmod 755 "$APP_START"

./start-up.sh

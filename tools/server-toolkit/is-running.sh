source .app-config
pgrep -a java | egrep "${APP_PS_IDENTIFIER}" | gawk '{print $1}'

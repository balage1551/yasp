read -p "Mi legyen a verzió elnevezése: V1_YYYYmmddhhMMSS__<verzio_neve>.sql: " version
timestamp="$(date +"%Y%m%d%H%M%S")"
fn="./backend/src/main/resources/sql/V1_${timestamp}__${version}.sql"
#echo "${processKey} ${process} $fn"
touch  "$fn"

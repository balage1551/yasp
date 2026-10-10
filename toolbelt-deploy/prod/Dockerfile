# Production image, built on the server as application/Dockerfile (see docker-compose-prod.yml).
# The war is `./gradlew :backend:bootWar`, frontend included, uploaded into deploy-temp/.
FROM eclipse-temurin:17-jre

# The working directory the gallery/ volume is mounted under; the slideshow root argument
# refers to it relatively.
WORKDIR /yasp

COPY deploy-temp/yasp.war app.war

ENTRYPOINT ["java", "-jar", "app.war"]

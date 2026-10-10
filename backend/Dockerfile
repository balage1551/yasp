# Local backend image (docker-compose-local.yml). The jar is built on the host by
# `./gradlew :backend:bootJar`, which the runner does before every rebuild of this image.
# The production image is toolbelt-deploy/prod/Dockerfile.
FROM eclipse-temurin:17-jdk

# The working directory the certs/ and gallery/ volumes are mounted under; the ssl config and
# the slideshow root argument refer to them relatively.
WORKDIR /yasp

COPY build/libs/yasp.jar app.jar

ENTRYPOINT ["java", "-jar", "app.jar"]

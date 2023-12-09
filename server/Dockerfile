FROM eclipse-temurin:11

WORKDIR /app
COPY . server
WORKDIR /app/server

RUN ./gradlew installDist
WORKDIR /app/server/build/install/server/bin

CMD ./server

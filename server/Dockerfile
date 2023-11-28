FROM eclipse-temurin:11

WORKDIR /app
COPY . server
WORKDIR server

RUN ./gradlew installDist
WORKDIR build/install/server/bin

CMD ./server

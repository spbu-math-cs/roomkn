FROM eclipse-temurin:11

ARG VERSION

WORKDIR /app
RUN wget https://github.com/spbu-math-cs/roomkn/releases/download/${VERSION}/server-${VERSION}.zip
RUN apt-get update
RUN apt-get install unzip
RUN unzip server-${VERSION}.zip
WORKDIR server-${VERSION}/bin

CMD ./server

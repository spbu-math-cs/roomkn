FROM node:16

ARG VERSION
ARG CLIENT_PORT
ARG SERVER_HOST
ARG SERVER_PORT

WORKDIR /app
RUN wget https://github.com/spbu-math-cs/roomkn/archive/refs/tags/${VERSION}.zip
RUN unzip ${VERSION}.zip
WORKDIR roomkn-${VERSION}/client

ENV REACT_APP_REST_SERVER_ADDRESS "http://${SERVER_HOST}:${SERVER_PORT}"

RUN npm install
RUN npm ci
RUN npm run build

ENV NODE_ENV production
ENV CLIENT_PORT ${CLIENT_PORT}

CMD npx serve build -l ${CLIENT_PORT} -s

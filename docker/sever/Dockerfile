FROM eclipse-temurin:11

ARG VERSION
ARG PORT

WORKDIR /app
RUN wget https://github.com/spbu-math-cs/roomkn/archive/refs/tags/${VERSION}.zip
RUN unzip ${VERSION}.zip
WORKDIR roomkn-${VERSION}/client

RUN npm install
RUN npm ci
RUN npm run build

ENV NODE_ENV production
ENV PORT ${PORT}
EXPOSE ${PORT}

CMD npx serve build -l ${PORT}

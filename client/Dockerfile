FROM node:16-alpine

ARG CLIENT_PORT
ARG SERVER_HOST
ARG SERVER_PORT

WORKDIR /app
COPY . client
WORKDIR /app/client

ENV REACT_APP_REST_SERVER_ADDRESS ${API_SERVER_ADDRESS}

# RUN npm install
RUN npm ci \
	&& npm run build \
	&& npm prune --production

ENV NODE_ENV production
ENV CLIENT_PORT ${CLIENT_PORT}

CMD npx serve build -l ${CLIENT_PORT} -s

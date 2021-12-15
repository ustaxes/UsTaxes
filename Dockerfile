FROM rust:1.51-slim-buster

RUN apt-get update && apt-get -y upgrade && apt-get install -y curl

# Install nvm, node, npm
ARG NVM_DIR="/root/.nvm"
ARG NODE_VERSION=14.6.0
RUN curl https://raw.githubusercontent.com/creationix/nvm/v0.38.0/install.sh | bash
RUN . $NVM_DIR/nvm.sh && nvm install $NODE_VERSION --latest-npm
ENV PATH $NVM_DIR/versions/node/v$NODE_VERSION/bin:$PATH

WORKDIR /app

ADD ./package.json ./package.json
ADD ./package-lock.json ./package-lock.json
RUN npm ci

ADD . .

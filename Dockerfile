FROM rust:1.51-slim-buster

RUN mkdir -p /home/node/app

RUN useradd -rm -d /home/node -s /bin/bash -g root -G sudo -u 1001 node

RUN chown -R node /home/node

RUN apt-get update && apt-get -y upgrade && apt-get install -y curl

USER node
# Install nvm, node, npm
ARG NVM_DIR="/home/node/.nvm"
ARG NODE_VERSION=16.7.0
RUN curl https://raw.githubusercontent.com/creationix/nvm/v0.38.0/install.sh | bash
RUN . $NVM_DIR/nvm.sh && nvm install $NODE_VERSION --latest-npm
ENV PATH $NVM_DIR/versions/node/v$NODE_VERSION/bin:$PATH

WORKDIR /home/node/app

ADD ./package.json ./package.json
ADD ./package-lock.json ./package-lock.json
ADD ./scripts ./scripts
RUN npm ci

ADD . .

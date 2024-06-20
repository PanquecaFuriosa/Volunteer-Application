FROM node:18.16.0-alpine

#COPY ./frontend /frontend
COPY ./frontend/yarn.lock /frontend/yarn.lock
COPY ./frontend/package.json /frontend/package.json

WORKDIR /frontend

RUN yarn install
CMD ["yarn", "start"]
EXPOSE 3000
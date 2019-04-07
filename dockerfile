FROM node:lts-slim
COPY dist /opt/my_app
RUN cd /opt/my_app/server && npm install --only=prod
CMD node /opt/my_app/server/index.js

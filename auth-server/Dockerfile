# Stage 0, "build-stage", based on Node.js, to build and compile the frontend
FROM node:11 
WORKDIR /app
COPY package*.json /app/
RUN npm install
COPY ./ /app/

EXPOSE 3000

CMD npm start 


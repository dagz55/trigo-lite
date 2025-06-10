# Dockerfile
FROM node:20

WORKDIR /app
COPY . .
RUN npm install

# Set this if you use build tools like TypeScript
# RUN npm run build

EXPOSE 3000
CMD ["npm", "start"]

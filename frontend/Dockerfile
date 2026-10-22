FROM node:22-alpine

WORKDIR /app

COPY package*.json ./

RUN npm install

COPY . .

# Expose the port your React dev server uses
EXPOSE 3000

# Start the React development server
CMD ["npm", "run", "dev"]
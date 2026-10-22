# Use a lightweight Node.js base image
FROM node:22-alpine

# Set the working directory inside the container
WORKDIR /app

# Copy package.json and package-lock.json first to leverage Docker cache
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy the rest of your backend application code
COPY . .

# Expose the port your Express server runs on
EXPOSE 5000

# Start the application 
CMD ["npm", "run" ,"dev"]
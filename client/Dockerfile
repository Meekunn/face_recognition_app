# # Use an official node image
# FROM node:18-alpine

# # Set working directory
# WORKDIR /app

# # Copy package.json and install dependencies
# COPY package.json ./
# RUN npm install

# # Copy the entire app directory to the container
# COPY . .

# # Build the app for production
# RUN npm run build

# # Install serve to serve the production build
# RUN npm i -g serve

# # Expose port 3000 for the production app
# EXPOSE 3000

# # Serve the build directory
# CMD ["serve", "-s", "dist"]

# Use an official node image
FROM node:18-alpine

# Set working directory
WORKDIR /app

# Copy package.json and package-lock.json (if available)
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy the rest of the app files to the container
COPY . .

# Expose port 3000 for the frontend
EXPOSE 3000

# Start the development server
CMD ["npm", "run", "dev"]
# Use Node.js LTS
FROM node:20-alpine

# Set working directory
WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy app source
COPY . .

# Expose ports
EXPOSE 3000 8080

# Start development server
CMD ["npm", "run", "dev"]

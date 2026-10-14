FROM node:18-alpine

WORKDIR /app

# Install dependencies
COPY package*.json ./
RUN npm install

# Copy application code
COPY src ./src

# Create uploads directory
RUN mkdir -p uploads/reviews

# Expose port
EXPOSE 8000

# Command to run the application
CMD ["npm", "start"]

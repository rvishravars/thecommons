# Use Node.js LTS
FROM node:20-alpine

# Set working directory
WORKDIR /app/spark-assembly-lab

# Copy package files
COPY package*.json ./

# Install Python for Flask backend
RUN apk add --no-cache python3 py3-pip

# Create virtualenv to avoid PEP 668 restrictions
RUN python3 -m venv /opt/venv
ENV PATH="/opt/venv/bin:$PATH"

# Install dependencies
RUN npm install

# Copy app source
COPY . ./

# Copy Scribe core for mission evaluation
COPY scribe/ /app/spark-assembly-lab/scribe

# Install Python dependencies
RUN pip install --no-cache-dir -r server_py/requirements.txt

# Expose ports
EXPOSE 3000 8080

# Start Flask API and Vite dev server
CMD ["sh", "-c", "python server_py/app.py & sleep 1 && npx vite --host 0.0.0.0 --port 3000"]

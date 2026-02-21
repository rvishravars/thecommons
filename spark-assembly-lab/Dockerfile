# Use Node.js LTS
FROM node:20-alpine

# Set working directory
WORKDIR /app/spark-assembly-lab

# Copy app source (includes package.json)
COPY spark-assembly-lab/ ./

# Install Python for Flask backend
RUN apk add --no-cache python3 py3-pip

# Create virtualenv to avoid PEP 668 restrictions
RUN python3 -m venv /opt/venv
ENV PATH="/opt/venv/bin:$PATH"

# Install dependencies
RUN npm install

# Scribe core is already included in the above COPY

# Install Python dependencies
RUN pip install --no-cache-dir -r server_py/requirements.txt

# Expose ports
EXPOSE 3000 8080

# Start Flask API and Vite dev server
CMD ["sh", "-c", "python server_py/app.py & sleep 1 && npx vite --host 0.0.0.0 --port 3000"]

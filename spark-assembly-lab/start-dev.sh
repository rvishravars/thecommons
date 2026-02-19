#!/bin/sh

# Generate sparks index
node scripts/generate-sparks-index.js

# Start the API server in the background
node server/index.js &
SERVER_PID=$!

# Start Vite dev server in the foreground
vite

# When Vite exits, kill the API server
kill $SERVER_PID 2>/dev/null

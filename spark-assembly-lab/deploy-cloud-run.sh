#!/bin/bash

# Spark Assembly Lab - GCP Cloud Run Deployment Script
# This script deploys the lab to GCP Cloud Run free tier.

set -e

# Configuration
SERVICE_NAME="spark-assembly-lab"
REGION="us-central1" # Change if needed
REPO_NAME="thecommons-repo"

echo "🚀 Starting deployment of $SERVICE_NAME to Google Cloud Run..."

# 1. Check for gcloud CLI
if ! command -v gcloud &> /dev/null; then
    echo "❌ Error: gcloud CLI is not installed. Please install it from: https://cloud.google.com/sdk/docs/install"
    exit 1
fi

# 2. Get Project ID
PROJECT_ID=$(gcloud config get-value project)
if [ -z "$PROJECT_ID" ] || [ "$PROJECT_ID" == "(unset)" ]; then
    echo "❌ Error: No default project set. Please run: gcloud config set project [YOUR_PROJECT_ID]"
    exit 1
fi

echo "✅ Using Project: $PROJECT_ID"
echo "✅ Region: $REGION"

# 3. Enable necessary APIs
echo "📡 Enabling Google Cloud APIs (this might take a minute)..."
gcloud services enable \
    run.googleapis.com \
    artifactregistry.googleapis.com \
    cloudbuild.googleapis.com \
    --quiet

# 4. Create Artifact Registry if it doesn't exist
echo "📦 Ensuring Artifact Registry exists..."
if ! gcloud artifacts repositories describe "$REPO_NAME" --location="$REGION" &> /dev/null; then
    gcloud artifacts repositories create "$REPO_NAME" \
        --repository-format=docker \
        --location="$REGION" \
        --description="TheCommons Project Docker Repository" \
        --quiet
fi

# 5. Prepare build context (Copy sparks into lab directory)
echo "📂 Preparing build context..."
LAB_DIR="."
SPARKS_SRC_DIR="../sparks"

if [ ! -d "$SPARKS_SRC_DIR" ]; then
    echo "❌ Error: Could not find sparks directory at $SPARKS_SRC_DIR"
    exit 1
fi

# Create a local sparks folder for Docker context
mkdir -p "$LAB_DIR/sparks"
cp -r "$SPARKS_SRC_DIR"/* "$LAB_DIR/sparks/"

# 6. Build and Push using Cloud Build
IMAGE_TAG="$REGION-docker.pkg.dev/$PROJECT_ID/$REPO_NAME/$SERVICE_NAME:latest"

echo "🛠️ Building and pushing image to Artifact Registry..."

# Create a temporary cloudbuild.yaml for the build
cat > "$LAB_DIR/cloudbuild.yaml" <<EOF
steps:
- name: 'gcr.io/cloud-builders/docker'
  args: ['build', '-t', '$IMAGE_TAG', '-f', 'Dockerfile.prod', '.']
images:
- '$IMAGE_TAG'
EOF

gcloud builds submit "$LAB_DIR" --config "$LAB_DIR/cloudbuild.yaml"
rm "$LAB_DIR/cloudbuild.yaml"

# 7. Deploy to Cloud Run
echo "🚀 Deploying to Cloud Run (Free Tier settings)..."
gcloud run deploy "$SERVICE_NAME" \
    --image "$IMAGE_TAG" \
    --platform managed \
    --region "$REGION" \
    --allow-unauthenticated \
    --set-env-vars "GITHUB_OWNER=rvishravars,GITHUB_REPO=thecommons,GITHUB_BRANCH=main,GITHUB_SPARKS_PATH=sparks,SPARK_CACHE_TTL_SECONDS=60" \
    --memory 128Mi \
    --cpu 1 \
    --max-instances 1 \
    --port 8080 \
    --quiet

# Clean up
rm -rf "$LAB_DIR/sparks"

echo ""
echo "🎉 Deployment complete!"
SERVICE_URL=$(gcloud run services describe "$SERVICE_NAME" --platform managed --region "$REGION" --format 'value(status.url)')
echo "🌐 Your app is live at: $SERVICE_URL"
echo ""
echo "💡 Note: This deployment is configured for the GCP Free Tier (128Mi RAM, 1 CPU, 1 Max Instance)."

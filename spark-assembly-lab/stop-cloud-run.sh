#!/bin/bash

# Spark Assembly Lab - GCP Cloud Run Teardown Script
# This script deletes the Cloud Run service to stop any potential billing/usage.

set -e

# Configuration (These must match deploy-cloud-run.sh)
SERVICE_NAME="spark-assembly-lab"
REGION="us-central1" 
REPO_NAME="thecommons-repo"

echo "🚨 Starting teardown of $SERVICE_NAME from Google Cloud Run..."

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

# 3. Delete the Cloud Run service
echo "🗑️ Deleting Cloud Run service '$SERVICE_NAME'..."
if gcloud run services describe "$SERVICE_NAME" --region "$REGION" &> /dev/null; then
    gcloud run services delete "$SERVICE_NAME" --region "$REGION" --quiet
    echo "✅ Service '$SERVICE_NAME' successfully deleted!"
else
    echo "⚠️ Service '$SERVICE_NAME' not found in region '$REGION'."
fi

echo ""
echo "🎉 Teardown complete!"
echo "💡 Note: The Artifact Registry repository and images still exist."
echo "   To delete the images to save storage, run:"
echo "   gcloud artifacts repositories delete $REPO_NAME --location=$REGION --quiet"

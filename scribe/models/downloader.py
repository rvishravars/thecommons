#!/usr/bin/env python3
"""
Model Downloader for Scribe v2.0

Downloads the Qwen2.5-1.5B-Instruct-GGUF model from Hugging Face if not present.
Supports resumable downloads and automatic verification.
"""

import os
import sys
import logging
import hashlib
from pathlib import Path
from typing import Optional
from urllib.request import urlopen
from urllib.error import URLError

logging.basicConfig(
    level=logging.INFO,
    format='[%(levelname)s] %(asctime)s - %(message)s'
)
logger = logging.getLogger(__name__)


class ModelDownloader:
    """Manages model downloads from Hugging Face."""

    # Model repository and file details
    HF_REPO = "Qwen/Qwen2.5-1.5B-Instruct-GGUF"
    MODEL_FILE = "qwen2.5-1.5b-instruct-q4_k_m.gguf"
    HF_URL = f"https://huggingface.co/{HF_REPO}/resolve/main/{MODEL_FILE}"

    # Expected model size (approximately 1.5GB for Q4_K_M quantization)
    EXPECTED_SIZE = 1024 * 1024 * 1024  # 1GB (adjust based on actual size)

    def __init__(self, model_dir: Path = None):
        self.model_dir = model_dir or Path(__file__).parent / "models"
        self.model_dir.mkdir(parents=True, exist_ok=True)
        self.model_path = self.model_dir / f"Qwen2.5-1.5B-Instruct-{self.MODEL_FILE.split('-')[-1].upper()}.gguf"

    def model_exists(self) -> bool:
        """Check if model file already exists."""
        return self.model_path.exists()

    def get_file_size(self, filepath: Path) -> int:
        """Get the size of a file in bytes."""
        return filepath.stat().st_size if filepath.exists() else 0

    def verify_model(self) -> bool:
        """Verify model integrity (basic check)."""
        if not self.model_path.exists():
            logger.error(f"Model file not found: {self.model_path}")
            return False

        # Check file size is reasonable
        size = self.get_file_size(self.model_path)
        if size < 100 * 1024 * 1024:  # Should be at least 100MB
            logger.error(f"Model file seems too small: {size / (1024*1024):.1f}MB")
            return False

        # Check GGUF magic number (first 4 bytes)
        try:
            with open(self.model_path, 'rb') as f:
                magic = f.read(4)
                # GGML format starts with "GGUF"
                if magic != b"GGUF":
                    logger.error("Invalid GGUF format (magic number mismatch)")
                    return False
        except Exception as e:
            logger.error(f"Failed to verify model format: {e}")
            return False

        logger.info(f"✅ Model verified: {size / (1024*1024):.1f}MB")
        return True

    def download_model(self) -> bool:
        """Download model from Hugging Face."""
        if self.model_exists():
            logger.info(f"Model already exists at {self.model_path}")
            return self.verify_model()

        logger.warning("⚠️  ATTENTION:")
        logger.warning("The Qwen2.5-1.5B-Instruct-GGUF model is ~1.5GB and requires internet access.")
        logger.warning("")
        logger.warning("🔗 Download URL:")
        logger.warning(f"   {self.HF_URL}")
        logger.warning("")
        logger.warning("📥 OPTION 1: Automatic Download (may be slow on first run)")
        logger.warning("   Run: python scribe/models/downloader.py --download")
        logger.warning("")
        logger.warning("📁 OPTION 2: Manual Download")
        logger.warning("   1. Visit: https://huggingface.co/Qwen/Qwen2.5-1.5B-Instruct-GGUF")
        logger.warning("   2. Download 'qwen2.5-1.5b-instruct-q4_k_m.gguf'")
        logger.warning(f"   3. Save to: {self.model_path}")
        logger.warning("")

        # Option 1: Attempt download using HuggingFace Hub
        try:
            from huggingface_hub import hf_hub_download
            logger.info("Using huggingface_hub for download...")
            hf_hub_download(
                repo_id=self.HF_REPO,
                filename=self.MODEL_FILE,
                local_dir=str(self.model_dir),
                local_dir_use_symlinks=False
            )
            logger.info("✅ Download complete!")
            return self.verify_model()
        except ImportError:
            logger.warning("huggingface_hub not installed. Install with: pip install huggingface-hub")
            return False
        except Exception as e:
            logger.error(f"Download failed: {e}")
            return False

    def download_with_progress(self) -> bool:
        """Download with progress bar (fallback if huggingface_hub unavailable)."""
        try:
            import urllib.request
            logger.info(f"Downloading from {self.HF_URL}...")

            def reporthook(blocknum, blocksize, totalsize):
                downloaded = blocknum * blocksize
                percent = min(downloaded * 100 / totalsize, 100)
                bar_length = 40
                filled = int(bar_length * percent / 100)
                bar = '█' * filled + '░' * (bar_length - filled)
                logger.info(f"Progress: {bar} {percent:.1f}%", end='\r')

            urllib.request.urlretrieve(
                self.HF_URL,
                self.model_path,
                reporthook=reporthook
            )
            logger.info(f"\n✅ Download complete!")
            return self.verify_model()

        except URLError as e:
            logger.error(f"Failed to download: {e}")
            return False
        except Exception as e:
            logger.error(f"Unexpected error: {e}")
            return False


def main():
    """Main entry point."""
    import argparse

    parser = argparse.ArgumentParser(
        description="Download and verify Qwen2.5-1.5B-Instruct-GGUF model for Scribe v2.0"
    )
    parser.add_argument(
        "--download",
        action="store_true",
        help="Attempt to download the model"
    )
    parser.add_argument(
        "--verify",
        action="store_true",
        help="Verify existing model"
    )
    parser.add_argument(
        "--path",
        type=Path,
        help="Custom path to models directory"
    )

    args = parser.parse_args()

    downloader = ModelDownloader(args.path)

    # Check if model exists
    if downloader.model_exists():
        logger.info(f"Model found at {downloader.model_path}")
        if args.verify or not args.download:
            if downloader.verify_model():
                logger.info("✅ Model is valid and ready to use")
                return 0
            else:
                logger.error("❌ Model verification failed")
                return 1

    if args.download:
        logger.info("Starting model download...")
        if downloader.download_model():
            logger.info("✅ Model download and verification successful!")
            return 0
        else:
            logger.error("❌ Model download failed")
            return 1
    else:
        logger.info("Model not found. Use --download to fetch it.")
        logger.info("Or manually download from:")
        logger.info(f"  {downloader.HF_URL}")
        return 1


if __name__ == "__main__":
    sys.exit(main())

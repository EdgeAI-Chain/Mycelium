# Base Image for Raspberry Pi (ARM64 compatible)
FROM python:3.11-slim

# Set working directory
WORKDIR /app

# Install system dependencies
# - build-essential: for compiling some python packages
# - libasound2-dev: for audio/microphone access (PyAudio)
# - libcamera-apps/v4l-utils: for camera access
# - portaudio19-dev: REQUIRED for PyAudio compilation
RUN apt-get update && apt-get install -y \
    build-essential \
    libasound2-dev \
    portaudio19-dev \
    v4l-utils \
    && rm -rf /var/lib/apt/lists/*

# Copy requirements first to leverage Docker cache
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy the rest of the application
COPY . .

# Environment variables
ENV PYTHONUNBUFFERED=1

# Run the main application
CMD ["python", "main.py"]

#!/usr/bin/env bash
set -e

# Create virtual environment using uv
uv venv .venv

# Activate (Unix/macOS)
if [[ -f .venv/bin/activate ]]; then
  source .venv/bin/activate
# Activate (Windows Git Bash)
elif [[ -f .venv/Scripts/activate ]]; then
  source .venv/Scripts/activate
else
  echo "Virtual environment not found"
  exit 1
fi

# Install Python project
uv pip install -e ".[dev]"

# Install Node.js dependencies
pnpm install

# Run pytest to verify installation
python -m pytest tests/ -v

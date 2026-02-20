#!/usr/bin/env python3
"""
PyInstaller entry point for brian-backend sidecar.

This wrapper exists because brian/main.py uses relative imports
(from .config import Config, etc.) which fail when PyInstaller
runs the script directly as __main__.

This file imports brian.main as a proper package module,
preserving the relative import chain.
"""
from brian.main import main

if __name__ == "__main__":
    main()

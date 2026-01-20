#!/usr/bin/env python3
"""
Simple test to see if the MCP server can start.
"""

import subprocess
import sys

# Try to run the server and see what happens
proc = subprocess.Popen(
    [sys.executable, "-m", "brian_mcp.server"],
    stdin=subprocess.PIPE,
    stdout=subprocess.PIPE,
    stderr=subprocess.PIPE,
    text=True
)

# Wait a moment
import time
time.sleep(2)

# Check if it's still running
if proc.poll() is None:
    print("✅ Server started successfully and is running!")
    proc.terminate()
    proc.wait()
else:
    print("❌ Server exited with code:", proc.returncode)
    stderr = proc.stderr.read()
    if stderr:
        print("\nError output:")
        print(stderr)

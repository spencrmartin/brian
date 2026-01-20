#!/usr/bin/env python3
"""
Simple test script to verify the MCP server can start and respond to basic requests.
"""

import subprocess
import json
import sys

def test_mcp_server():
    """Test that the MCP server can start and list tools"""
    
    print("Testing Brian MCP Server...")
    print("-" * 50)
    
    # Start the MCP server
    proc = subprocess.Popen(
        [sys.executable, "-m", "brian_mcp.server"],
        stdin=subprocess.PIPE,
        stdout=subprocess.PIPE,
        stderr=subprocess.PIPE,
        text=True
    )
    
    # Send initialize request
    init_request = {
        "jsonrpc": "2.0",
        "id": 1,
        "method": "initialize",
        "params": {
            "protocolVersion": "2024-11-05",
            "capabilities": {},
            "clientInfo": {
                "name": "test-client",
                "version": "1.0.0"
            }
        }
    }
    
    print("Sending initialize request...")
    proc.stdin.write(json.dumps(init_request) + "\n")
    proc.stdin.flush()
    
    # Read response
    response_line = proc.stdout.readline()
    print(f"Response: {response_line[:100]}...")
    
    # Send tools/list request
    list_tools_request = {
        "jsonrpc": "2.0",
        "id": 2,
        "method": "tools/list",
        "params": {}
    }
    
    print("\nSending tools/list request...")
    proc.stdin.write(json.dumps(list_tools_request) + "\n")
    proc.stdin.flush()
    
    # Read response
    response_line = proc.stdout.readline()
    if response_line:
        try:
            response = json.loads(response_line)
            if "result" in response and "tools" in response["result"]:
                tools = response["result"]["tools"]
                print(f"\n✅ Success! Found {len(tools)} tools:")
                for tool in tools:
                    print(f"  - {tool['name']}: {tool['description'][:60]}...")
            else:
                print(f"❌ Unexpected response format: {response}")
        except json.JSONDecodeError as e:
            print(f"❌ Failed to parse response: {e}")
            print(f"Raw response: {response_line}")
    
    # Cleanup
    proc.terminate()
    proc.wait(timeout=5)
    
    print("\n" + "-" * 50)
    print("Test complete!")

if __name__ == "__main__":
    test_mcp_server()

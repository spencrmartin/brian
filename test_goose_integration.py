#!/usr/bin/env python3
"""
Test script to verify Brian MCP server is working correctly.
Run this before and after configuring Goose to ensure everything works.
"""

import subprocess
import sys
import json
import time
from pathlib import Path

def test_server_starts():
    """Test 1: Can the server start?"""
    print("🧪 Test 1: Server Startup")
    print("-" * 50)
    
    venv_python = Path.home() / "brian/venv/bin/python"
    
    proc = subprocess.Popen(
        [str(venv_python), "-m", "brian_mcp.server"],
        stdin=subprocess.PIPE,
        stdout=subprocess.PIPE,
        stderr=subprocess.PIPE,
        text=True,
        cwd=str(Path.home() / "brian")
    )
    
    time.sleep(2)
    
    if proc.poll() is None:
        print("✅ Server started successfully")
        proc.terminate()
        proc.wait()
        return True
    else:
        print("❌ Server failed to start")
        stderr = proc.stderr.read()
        if stderr:
            print(f"\nError output:\n{stderr}")
        return False

def test_database_exists():
    """Test 2: Does the database exist?"""
    print("\n🧪 Test 2: Database Check")
    print("-" * 50)
    
    db_path = Path.home() / ".brian/brian.db"
    
    if db_path.exists():
        print(f"✅ Database exists at {db_path}")
        
        # Check if it has data
        try:
            import sqlite3
            conn = sqlite3.connect(str(db_path))
            cursor = conn.cursor()
            cursor.execute("SELECT COUNT(*) FROM knowledge_items")
            count = cursor.fetchone()[0]
            conn.close()
            print(f"✅ Database has {count} items")
            return True
        except Exception as e:
            print(f"⚠️  Database exists but couldn't query: {e}")
            return False
    else:
        print(f"❌ Database not found at {db_path}")
        print("   Run Brian web app first to create the database")
        return False

def test_goose_config():
    """Test 3: Is Brian configured in Goose?"""
    print("\n🧪 Test 3: Goose Configuration")
    print("-" * 50)
    
    config_path = Path.home() / ".config/goose/config.yaml"
    
    if not config_path.exists():
        print(f"❌ Goose config not found at {config_path}")
        return False
    
    with open(config_path) as f:
        config_content = f.read()
    
    if "brian:" in config_content:
        print("✅ Brian extension found in Goose config")
        
        if "enabled: true" in config_content.split("brian:")[1].split("\n")[0:10]:
            print("✅ Brian extension is enabled")
            return True
        else:
            print("⚠️  Brian extension exists but may not be enabled")
            return False
    else:
        print("❌ Brian extension not found in Goose config")
        print("   Run the setup script to add it")
        return False

def test_python_path():
    """Test 4: Is the Python venv accessible?"""
    print("\n🧪 Test 4: Python Environment")
    print("-" * 50)
    
    venv_python = Path.home() / "brian/venv/bin/python"
    
    if venv_python.exists():
        print(f"✅ Python venv found at {venv_python}")
        
        # Test if mcp is installed
        result = subprocess.run(
            [str(venv_python), "-c", "import mcp; print(mcp.__version__)"],
            capture_output=True,
            text=True
        )
        
        if result.returncode == 0:
            print(f"✅ MCP package installed (version {result.stdout.strip()})")
            return True
        else:
            print("❌ MCP package not installed in venv")
            print("   Run: cd ~/brian && source venv/bin/activate && pip install mcp")
            return False
    else:
        print(f"❌ Python venv not found at {venv_python}")
        return False

def test_imports():
    """Test 5: Can we import Brian modules?"""
    print("\n🧪 Test 5: Brian Module Imports")
    print("-" * 50)
    
    venv_python = Path.home() / "brian/venv/bin/python"
    brian_path = Path.home() / "brian"
    
    test_script = """
import sys
sys.path.insert(0, '%s')
try:
    from brian.database.connection import Database
    from brian.database.repository import KnowledgeRepository
    from brian.models.knowledge_item import KnowledgeItem
    print('SUCCESS')
except Exception as e:
    print(f'ERROR: {e}')
""" % brian_path
    
    result = subprocess.run(
        [str(venv_python), "-c", test_script],
        capture_output=True,
        text=True,
        cwd=str(brian_path)
    )
    
    if "SUCCESS" in result.stdout:
        print("✅ All Brian modules import successfully")
        return True
    else:
        print("❌ Failed to import Brian modules")
        print(f"   Error: {result.stdout + result.stderr}")
        return False

def main():
    """Run all tests"""
    print("=" * 50)
    print("🧠 Brian MCP Integration Test Suite")
    print("=" * 50)
    print()
    
    tests = [
        ("Server Startup", test_server_starts),
        ("Database Check", test_database_exists),
        ("Goose Configuration", test_goose_config),
        ("Python Environment", test_python_path),
        ("Module Imports", test_imports),
    ]
    
    results = []
    for name, test_func in tests:
        try:
            result = test_func()
            results.append((name, result))
        except Exception as e:
            print(f"❌ Test crashed: {e}")
            results.append((name, False))
    
    # Summary
    print("\n" + "=" * 50)
    print("📊 Test Summary")
    print("=" * 50)
    
    passed = sum(1 for _, result in results if result)
    total = len(results)
    
    for name, result in results:
        status = "✅ PASS" if result else "❌ FAIL"
        print(f"{status} - {name}")
    
    print()
    print(f"Results: {passed}/{total} tests passed")
    
    if passed == total:
        print("\n🎉 All tests passed! Brian MCP is ready for Goose.")
        print("\n📝 Next steps:")
        print("   1. Restart Goose Desktop")
        print("   2. Try: 'What do I know about [topic]?'")
        print("   3. Try: 'Save this link: [URL]'")
        return 0
    else:
        print("\n⚠️  Some tests failed. Check the output above for details.")
        print("\n📝 Common fixes:")
        print("   - Install MCP: cd ~/brian && source venv/bin/activate && pip install mcp")
        print("   - Create database: Run Brian web app once")
        print("   - Add to Goose: Check GOOSE_INTEGRATION.md")
        return 1

if __name__ == "__main__":
    sys.exit(main())

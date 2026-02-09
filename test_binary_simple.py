"""Simple test for binary stdin/stdout."""
import subprocess
import json

def test_with_stdin_close(binary_path):
    """Test by closing stdin after sending request."""
    request = {
        "method": "parse",
        "params": {
            "sourceCode": "x + y"
        }
    }
    
    proc = subprocess.Popen(
        [binary_path],
        stdin=subprocess.PIPE,
        stdout=subprocess.PIPE,
        stderr=subprocess.PIPE,
        text=True
    )
    
    request_line = json.dumps(request) + "\n"
    print(f"Sending: {request_line.strip()}")
    
    # Send and close stdin
    stdout, stderr = proc.communicate(input=request_line, timeout=5)
    
    print(f"\n=== Results ===")
    print(f"Exit code: {proc.returncode}")
    print(f"\nSTDOUT:")
    print(stdout if stdout else "(empty)")
    print(f"\nSTDERR:")
    print(stderr if stderr else "(empty)")
    
    if stdout.strip():
        try:
            response = json.loads(stdout.strip())
            print(f"\n=== Parsed Response ===")
            print(json.dumps(response, indent=2))
            if "result" in response:
                print("\n[SUCCESS] Binary works correctly!")
                return True
        except json.JSONDecodeError:
            print("\n[ERROR] Invalid JSON response")
    
    return False

def test_python_service():
    """Test Python service with proper command."""
    request = {
        "method": "parse",
        "params": {
            "sourceCode": "x + y"
        }
    }
    
    proc = subprocess.Popen(
        [r".venv\Scripts\python.exe", "-u", "-m", "python_service"],
        stdin=subprocess.PIPE,
        stdout=subprocess.PIPE,
        stderr=subprocess.PIPE,
        text=True
    )
    
    request_line = json.dumps(request) + "\n"
    print(f"Sending: {request_line.strip()}")
    
    stdout, stderr = proc.communicate(input=request_line, timeout=5)
    
    print(f"\n=== Results ===")
    print(f"Exit code: {proc.returncode}")
    print(f"\nSTDOUT:")
    print(stdout if stdout else "(empty)")
    print(f"\nSTDERR:")
    print(stderr if stderr else "(empty)")
    
    if stdout.strip():
        try:
            response = json.loads(stdout.strip())
            print(f"\n=== Parsed Response ===")
            print(json.dumps(response, indent=2))
            if "result" in response:
                print("\n[SUCCESS] Python service works!")
                return True
        except json.JSONDecodeError:
            print("\n[ERROR] Invalid JSON response")
    
    return False

if __name__ == "__main__":
    # Test Python service first
    print("Testing: python -m python_service")
    print("=" * 60)
    py_success = test_python_service()
    
    # Test binary
    print("\n\nTesting: bin\\python_service-win-x64.exe")
    print("=" * 60)
    bin_success = test_with_stdin_close(r"bin\python_service-win-x64.exe")
    
    print("\n\n" + "=" * 60)
    print("SUMMARY")
    print("=" * 60)
    print(f"Python service: {'PASS' if py_success else 'FAIL'}")
    print(f"Binary: {'PASS' if bin_success else 'FAIL'}")

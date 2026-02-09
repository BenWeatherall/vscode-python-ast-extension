"""Test script for binary execution."""
import subprocess
import json
import sys
import threading
import time

def test_binary_interactive(binary_path, source_code):
    """Test binary with interactive stdin/stdout (like PythonClient)."""
    request = {
        "method": "parse",
        "params": {
            "sourceCode": source_code
        }
    }
    
    try:
        # Spawn the binary - keep it alive
        proc = subprocess.Popen(
            [binary_path],
            stdin=subprocess.PIPE,
            stdout=subprocess.PIPE,
            stderr=subprocess.PIPE,
            text=True,
            bufsize=1  # Line buffered
        )
        
        print(f"Process spawned, PID: {proc.pid}")
        time.sleep(0.5)  # Give it time to initialize
        
        # Check if process is still running
        if proc.poll() is not None:
            print(f"[ERROR] Process exited immediately with code {proc.returncode}")
            stderr_output = proc.stderr.read()
            if stderr_output:
                print(f"STDERR: {stderr_output}")
            return
        
        print("Process is running, sending request...")
        
        # Send request
        request_line = json.dumps(request) + "\n"
        print(f"Request: {request_line.strip()}")
        proc.stdin.write(request_line)
        proc.stdin.flush()
        
        print("Request sent, waiting for response...")
        
        # Read response with timeout
        response_received = []
        
        def read_output():
            try:
                line = proc.stdout.readline()
                if line:
                    response_received.append(line)
                    print(f"Response received: {line.strip()}")
            except Exception as e:
                print(f"Error reading output: {e}")
        
        reader = threading.Thread(target=read_output)
        reader.daemon = True
        reader.start()
        reader.join(timeout=3)
        
        if response_received:
            response_line = response_received[0]
            try:
                response = json.loads(response_line)
                print("\n=== PARSED RESPONSE ===")
                print(json.dumps(response, indent=2))
                
                if "result" in response:
                    print("\n[SUCCESS] Received valid result")
                    nodes = response["result"]["nodes"]
                    print(f"   Nodes: {len(nodes)}")
                    connections = response["result"]["connections"]
                    print(f"   Connections: {len(connections)}")
                elif "error" in response:
                    print("\n[ERROR] Received error response")
                    print(f"   Code: {response['error']['code']}")
                    print(f"   Message: {response['error']['message']}")
            except json.JSONDecodeError as e:
                print(f"[ERROR] Failed to parse response: {e}")
                print(f"Raw response: {response_line}")
        else:
            print("\n[WARNING] No response received within timeout")
            # Check stderr
            try:
                stderr_line = proc.stderr.readline()
                if stderr_line:
                    print(f"STDERR: {stderr_line.strip()}")
            except:
                pass
        
        # Kill process
        proc.kill()
        proc.wait()
        
    except Exception as e:
        print(f"[ERROR] {type(e).__name__}: {e}")
        import traceback
        traceback.print_exc()

if __name__ == "__main__":
    test_code = "def hello(): pass"
    
    # Test Python service first
    print("=" * 60)
    print("Testing Python service (python -m python_service)")
    print("=" * 60)
    python_path = r".venv\Scripts\python.exe"
    test_binary_interactive(python_path + " -m python_service", test_code)
    
    # Test binary
    print("\n" + "=" * 60)
    print("Testing binary (bin\\python_service-win-x64.exe)")
    print("=" * 60)
    binary_path = r"bin\python_service-win-x64.exe"
    test_binary_interactive(binary_path, test_code)

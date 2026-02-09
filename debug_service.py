"""Debug version of Python service with logging."""
import sys
import json

print("DEBUG: Service starting...", file=sys.stderr)
sys.stderr.flush()

try:
    print("DEBUG: Waiting for input...", file=sys.stderr)
    sys.stderr.flush()
    
    for line in sys.stdin:
        print(f"DEBUG: Received line: {repr(line)}", file=sys.stderr)
        sys.stderr.flush()
        
        line = line.strip()
        if not line:
            print("DEBUG: Empty line, skipping", file=sys.stderr)
            sys.stderr.flush()
            continue
        
        print(f"DEBUG: Processing: {line}", file=sys.stderr)
        sys.stderr.flush()
        
        try:
            data = json.loads(line)
            print(f"DEBUG: Parsed JSON: {data}", file=sys.stderr)
            sys.stderr.flush()
            
            # Simple echo response
            response = {"result": {"received": data}}
            response_line = json.dumps(response) + "\n"
            
            print(f"DEBUG: Sending response: {repr(response_line)}", file=sys.stderr)
            sys.stderr.flush()
            
            sys.stdout.write(response_line)
            sys.stdout.flush()
            
            print("DEBUG: Response sent!", file=sys.stderr)
            sys.stderr.flush()
            
        except Exception as e:
            print(f"DEBUG: Error: {e}", file=sys.stderr)
            sys.stderr.flush()
    
    print("DEBUG: stdin closed, exiting", file=sys.stderr)
    sys.stderr.flush()
    
except Exception as e:
    print(f"DEBUG: Fatal error: {e}", file=sys.stderr)
    sys.stderr.flush()

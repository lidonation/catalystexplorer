import sys
import cbor2
import brotli
import uuid
import json
from _cbor2 import CBORTag


def print_json(obj):
    print(json.dumps(obj, cls=CustomEncoder))


class CustomEncoder(json.JSONEncoder):
    def default(self, obj):
        if isinstance(obj, uuid.UUID):
            return str(obj)
        if isinstance(obj, bytes):
            return obj.hex()
        # Handle CBOR tags specifically
        if isinstance(obj, CBORTag):
            return {
                '_cbor_tag': obj.tag,
                'value': obj.value
            }
        # Handle other non-serializable objects
        if hasattr(obj, '__dict__'):
            return obj.__dict__
        return str(obj)  # Fallback to string representation


# === Step 1: Read input with validation
try:
    if len(sys.argv) > 1:
        with open(sys.argv[1], "rb") as f:
            raw_data = f.read()
    else:
        raw_data = sys.stdin.buffer.read()
    
    # Validate input size
    if len(raw_data) == 0:
        print_json({"error": "Empty input data"})
        sys.exit(1)
        
    if len(raw_data) > 10 * 1024 * 1024:  # 10MB limit
        print_json({"error": f"Input too large: {len(raw_data)} bytes"})
        sys.exit(1)
        
except Exception as e:
    print_json({"error": f"Could not read input: {str(e)}"})
    sys.exit(1)

# === Step 2: Try to decode as direct CBOR first with validation
payload = None
payload_error = None

try:
    # Basic sanity check for CBOR format
    if len(raw_data) < 2:
        raise ValueError("Data too short to be valid CBOR")
    
    # Try direct CBOR decode with size limits
    cbor_data = cbor2.loads(raw_data)
    
    # Validate and process the decoded data safely
    if isinstance(cbor_data, list):
        # Limit array size to prevent excessive processing
        if len(cbor_data) > 1000:
            raise ValueError(f"CBOR array too large: {len(cbor_data)} items")
            
        if len(cbor_data) > 0:
            # Try to find compressed data in the array (limit iterations)
            for i, item in enumerate(cbor_data[:100]):  # Limit to first 100 items
                if isinstance(item, bytes):
                    # Limit decompression to reasonable sizes
                    if len(item) > 5 * 1024 * 1024:  # 5MB limit for compressed data
                        continue
                    try:
                        decompressed = brotli.decompress(item)
                        if len(decompressed) > 20 * 1024 * 1024:  # 20MB limit for decompressed
                            continue
                        payload = cbor2.loads(decompressed)
                        break
                    except Exception:
                        continue
            
            # If no brotli-compressed data found, use the cbor_data as-is
            if payload is None:
                payload = cbor_data
    else:
        payload = cbor_data
        
except Exception as e:
    error_msg = str(e)
    # Truncate very long error messages
    if len(error_msg) > 200:
        error_msg = error_msg[:200] + "..."
    payload_error = f"Failed to decode CBOR: {error_msg}"
    payload = raw_data[:1000].hex() + ("..." if len(raw_data) > 1000 else "")  # Limit hex output

# === Step 3: Output result
output = {
    "payload": payload,
}

if payload_error:
    output["payload_error"] = payload_error

print_json(output)

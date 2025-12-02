import sys
import cbor2
import brotli
import uuid
import json
import signal
import time
from pycose.messages import CoseMessage
from pycose.headers import KID
from _cbor2 import CBORTag

# Add timeout protection
class TimeoutError(Exception):
    pass

def timeout_handler(signum, frame):
    raise TimeoutError("Recursive decoder timed out")

# Set timeout to 25 seconds (less than PHP's 30 second timeout)
signal.signal(signal.SIGALRM, timeout_handler)
signal.alarm(25)


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


def handle_catalyst_payload(payload_array, depth=0, max_depth=10):
    """Specifically handle Catalyst document payload structure"""
    print(f"DEBUG: handle_catalyst_payload called with type: {type(payload_array)}", file=sys.stderr)
    
    if not isinstance(payload_array, list):
        print(f"DEBUG: Not a list, recursively decoding {type(payload_array)}", file=sys.stderr)
        return recursive_decode_cbor(payload_array, depth, max_depth)
        
    print(f"DEBUG: Payload array length: {len(payload_array)}", file=sys.stderr)
    for i, item in enumerate(payload_array):
        print(f"DEBUG: payload[{i}] type: {type(item)}, length/value: {len(item) if hasattr(item, '__len__') else item}", file=sys.stderr)
    
    # Process each element of the payload array
    result = []
    for i, item in enumerate(payload_array):
        if i == 1 and isinstance(item, (bytes, str)):
            # payload[1] typically contains brotli-compressed proposal data
            if isinstance(item, str) and len(item) > 0:
                try:
                    # Convert hex to bytes if it's a hex string
                    if all(c in '0123456789abcdefABCDEF' for c in item):
                        item = bytes.fromhex(item)
                except Exception:
                    pass
            
            if isinstance(item, bytes) and len(item) > 0:
                try:
                    # Try brotli decompression
                    decompressed = brotli.decompress(item)
                    try:
                        # Try CBOR decode of decompressed data
                        proposal_data = cbor2.loads(decompressed)
                        result.append(recursive_decode_cbor(proposal_data, depth + 1, max_depth))
                        continue
                    except Exception:
                        pass
                    
                    try:
                        # Try as JSON
                        text = decompressed.decode('utf-8')
                        json_data = json.loads(text)
                        result.append(json_data)
                        continue
                    except Exception:
                        pass
                    
                    try:
                        # Try as plain text
                        text = decompressed.decode('utf-8')
                        result.append(text)
                        continue
                    except Exception:
                        pass
                except Exception:
                    pass  # Not brotli compressed
        
        # Default recursive processing for all other items
        result.append(recursive_decode_cbor(item, depth, max_depth))
    
    return result


def recursive_decode_cbor(data, depth=0, max_depth=10, iteration_count=0, max_iterations=1000):
    """Recursively decode CBOR data at any nesting level"""
    if depth > max_depth:
        return data  # Prevent infinite recursion
    
    if iteration_count > max_iterations:
        print(f"WARNING: Maximum iterations ({max_iterations}) reached, stopping recursion", file=sys.stderr)
        return data
    
    if isinstance(data, str):
        # Try to decode hex strings as CBOR
        try:
            if len(data) > 0 and all(c in '0123456789abcdefABCDEF' for c in data):
                hex_bytes = bytes.fromhex(data)
                decoded = cbor2.loads(hex_bytes)
                return recursive_decode_cbor(decoded, depth + 1, max_depth, iteration_count + 1, max_iterations)
        except Exception:
            pass  # Not valid hex or CBOR, return as string
        return data
    
    elif isinstance(data, bytes):
        # Try to decode bytes as CBOR
        try:
            decoded = cbor2.loads(data)
            return recursive_decode_cbor(decoded, depth + 1, max_depth)
        except Exception:
            pass  # Not valid CBOR
        
        # Try brotli decompression first
        try:
            decompressed = brotli.decompress(data)
            try:
                decoded = cbor2.loads(decompressed)
                return recursive_decode_cbor(decoded, depth + 1, max_depth)
            except Exception:
                # If not CBOR, try as text/JSON
                try:
                    text = decompressed.decode('utf-8')
                    try:
                        return json.loads(text)
                    except json.JSONDecodeError:
                        return text
                except UnicodeDecodeError:
                    pass
        except Exception:
            pass  # Not brotli compressed
        
        # Return as hex string if can't decode
        return data.hex()
    
    elif isinstance(data, list):
        # Recursively decode all items in the list
        return [recursive_decode_cbor(item, depth + 1, max_depth) for item in data]
    
    elif isinstance(data, dict):
        # Recursively decode all values in the dict
        result = {}
        for key, value in data.items():
            # Also try to decode keys if they're bytes/strings
            decoded_key = recursive_decode_cbor(key, depth + 1, max_depth) if isinstance(key, (bytes, str)) else key
            decoded_value = recursive_decode_cbor(value, depth + 1, max_depth)
            result[decoded_key] = decoded_value
        return result
    
    else:
        # Return primitive types as-is
        return data


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

# === Step 2: Try COSE decode first
try:
    # Basic sanity check for COSE format
    if len(raw_data) >= 10:
        cose_msg = CoseMessage.decode(raw_data)
        
        if hasattr(cose_msg, 'payload'):
            # Extract headers and signatures
            protected_headers = {str(k): v for k, v in cose_msg.phdr.items()}
            signatures = []
            
            if hasattr(cose_msg, 'signers'):
                for signer in cose_msg.signers:
                    kid = signer.phdr.get(KID)
                    signatures.append({
                        "kid": kid.decode() if kid else None,
                        "protected": {str(k): v for k, v in signer.phdr.items()},
                        "signature": signer.signature.hex(),
                    })
            
            # Decompress and recursively decode payload
            try:
                decompressed = brotli.decompress(cose_msg.payload)
                payload = cbor2.loads(decompressed)
                # Use special Catalyst payload handler
                payload = handle_catalyst_payload(payload)
            except Exception as e:
                payload = cose_msg.payload.hex()
            
            output = {
                "protected_headers": protected_headers,
                "payload": payload,
                "signatures": signatures,
            }
            print_json(output)
            sys.exit(0)
            
except Exception as e:
    # Fall through to direct CBOR decode
    pass

# === Step 3: Try direct CBOR decode with recursive processing
try:
    if len(raw_data) >= 2:
        cbor_data = cbor2.loads(raw_data)
        
        # Use special Catalyst payload handler
        payload = handle_catalyst_payload(cbor_data)
        
        output = {
            "payload": payload,
        }
        print_json(output)
        sys.exit(0)
        
except Exception as e:
    error_msg = str(e)
    if len(error_msg) > 200:
        error_msg = error_msg[:200] + "..."
    
    output = {
        "payload": raw_data[:1000].hex() + ("..." if len(raw_data) > 1000 else ""),
        "payload_error": f"Failed to decode: {error_msg}"
    }
    print_json(output)
import sys
import cbor2
import brotli
import uuid
import json
from pycose.messages import CoseMessage
from pycose.headers import KID
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

# === Step 2: Decode COSE message with validation
try:
    # Basic sanity check for COSE format
    if len(raw_data) < 10:
        raise ValueError("Data too short to be valid COSE")
    
    # Try to decode, but limit processing time by checking data structure
    cose_msg = CoseMessage.decode(raw_data)
    
    # Validate the decoded message structure
    if not hasattr(cose_msg, 'payload'):
        raise ValueError("Invalid COSE message: missing payload")
        
except Exception as e:
    error_msg = str(e)
    # Truncate very long error messages
    if len(error_msg) > 200:
        error_msg = error_msg[:200] + "..."
    print_json({"error": f"Failed to decode COSE: {error_msg}"})
    sys.exit(1)

# === Step 3: Extract headers and signatures
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

# === Step 4: Decompress and parse payload
payload = None
payload_error = None

try:
    decompressed = brotli.decompress(cose_msg.payload)
    try:
        payload = cbor2.loads(decompressed)
        if isinstance(payload, str):
            try:
                payload = json.loads(payload)
            except json.JSONDecodeError:
                pass
    except Exception:
        try:
            payload = decompressed.decode()
            payload = json.loads(payload)
        except Exception as e2:
            payload_error = f"Failed to parse payload JSON: {str(e2)}"
            payload = decompressed.decode(errors="replace")
except Exception as e:
    payload_error = f"Failed to decompress or decode payload: {str(e)}"
    payload = cose_msg.payload.hex()

# === Step 5: Output result
output = {
    "protected_headers": protected_headers,
    "payload": payload,
    "signatures": signatures,
}

if payload_error:
    output["payload_error"] = payload_error

print_json(output)
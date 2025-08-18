import sys
import cbor2
import brotli
import uuid
import json
from pycose.messages import CoseMessage
from pycose.headers import KID


def print_json(obj):
    print(json.dumps(obj, cls=CustomEncoder))


class CustomEncoder(json.JSONEncoder):
    def default(self, obj):
        if isinstance(obj, uuid.UUID):
            return str(obj)
        if isinstance(obj, bytes):
            return obj.hex()
        return super().default(obj)

# === Step 1: Read input
try:
    if len(sys.argv) > 1:
        with open(sys.argv[1], "rb") as f:
            raw_data = f.read()
    else:
        raw_data = sys.stdin.buffer.read()
except Exception as e:
    print_json({"error": f"Could not read input: {str(e)}"})
    sys.exit(1)

# === Step 2: Decode COSE message
try:
    cose_msg = CoseMessage.decode(raw_data)
except Exception as e:
    print_json({"error": f"Failed to decode COSE: {str(e)}"})
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
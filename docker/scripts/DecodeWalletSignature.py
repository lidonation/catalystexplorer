#!/usr/bin/env python3
import sys
import binascii
import json
import cbor2
from pycardano import Address

def decode_signature(signature_hex: str) -> dict:
    result = {}
    try:
        # Convert hex → bytes
        sig_bytes = binascii.unhexlify(signature_hex.strip())

        # Decode outer CBOR
        decoded = cbor2.loads(sig_bytes)

        # Extract inner CBOR for gaddress
        address_blob = decoded[0]
        inner = cbor2.loads(address_blob)
        addr_bytes = inner.get("address")

        # Parse Cardano base address
        addr = Address.from_primitive(addr_bytes)

        result["bech32_address"] = addr.encode()
        result["network"] = str(addr.network)
        result["address_type"] = str(addr.address_type)

        if addr.payment_part is not None:
            result["payment_key_hash"] = addr.payment_part.to_primitive().hex()

        if addr.staking_part is not None:
            # Construct a stake address from staking part
            stake_addr = Address(
                payment_part=None,
                staking_part=addr.staking_part,
                network=addr.network
            )
            result["stake_address"] = stake_addr.encode()
            result["stake_key_hash"] = addr.staking_part.to_primitive().hex()

        # Signature message (UTF-8 string in CBOR)
        if isinstance(decoded[2], (bytes, bytearray)):
            try:
                result["signature_message"] = decoded[2].decode("utf-8")
            except Exception:
                result["signature_message"] = decoded[2].hex()
        else:
            result["signature_message"] = str(decoded[2])

        # Signature itself (raw bytes at index 3)
        if isinstance(decoded[3], (bytes, bytearray)):
            result["signature_hex"] = decoded[3].hex()

    except Exception as e:
        return {"error": str(e)}

    return result


if __name__ == "__main__":
    # Read signature from stdin instead of command line arguments
    try:
        signature_hex = sys.stdin.read().strip()
        if not signature_hex:
            print(json.dumps({"error": "No signature provided via stdin"}))
            sys.exit(1)
    except Exception as e:
        print(json.dumps({"error": f"Failed to read from stdin: {str(e)}"}))
        sys.exit(1)
        
    decoded = decode_signature(signature_hex)
    print(json.dumps(decoded, indent=2))

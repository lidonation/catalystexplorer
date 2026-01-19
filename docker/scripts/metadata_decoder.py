import os
import sys
import json
import uuid
import logging
import re
from typing import Dict, Any, List, Union, Optional
import cbor2
import brotli
import zstandard as zstd
from pycardano import (
    Address,
    Network,
    VerificationKey,
    PaymentVerificationKey,
    StakeVerificationKey,
)

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

class TransactionsService:
    def __init__(self):
        pass

    def decode_transaction(self, raw_tx: Dict[str, Any]) -> Dict[str, Any]:
        if not raw_tx:
            raise ValueError("Invalid transaction")
        return self.normalize_metadata(raw_tx.get('json_metadata'))

    def get_network(self) -> Network:
        return Network.TESTNET if os.environ.get('NETWORK') == '0' else Network.MAINNET

    def normalize_metadata(self, metadata: Dict[str, Any]) -> Dict[str, Any]:
        if not metadata:
             return {}

        tx_type = 'cip36'

        key_mappings_cip36 = {
            '1': {
                'key': 'voter_delegations',
                'value': ['voting_key', 'weight', 'votePublicKey'],
            },
            '2': 'stake_key',
            '3': 'payment_address',
            '4': 'nonce',
            '5': 'voting_purpose',
        }

        key_mappings_cip15 = {
            '1': 'voting_key',
            '2': 'stake_key',
            '3': 'payment_address',
            '4': 'nonce',
            '5': 'voting_purpose',
        }

        key_mappings_x509 = {
            '0': 'purpose_uuid',
            '1': 'txn_inputs_hash',
            '2': 'previous_transaction_id',
            '10': 'x509_raw_data',
            '11': 'x509_brotli_data',
            '12': 'x509_zstd_data',
            '99': 'validation_signature',
        }

        # Check for X509 envelope
        has_0 = '0' in metadata
        has_10_11_12 = '10' in metadata or '11' in metadata or '12' in metadata
        has_99 = '99' in metadata

        if has_0 and has_10_11_12 and has_99:
            tx_type = 'x509_envelope'
        elif '1' in metadata and isinstance(metadata['1'], list) and len(metadata['1']) > 0 and not isinstance(metadata['1'][0], list):
            tx_type = 'cip15'

        acc = {}

        for key, value in metadata.items():
            key_str = str(key)
            mapping = None

            if tx_type == 'x509_envelope':
                mapping = key_mappings_x509.get(key_str)
            elif tx_type == 'cip15':
                mapping = key_mappings_cip15.get(key_str)
            else:
                mapping = key_mappings_cip36.get(key_str)

            if key_str == '0':
                if tx_type == 'x509_envelope':
                    acc['purpose_uuid'] = self.cbor_array_to_str(value)
                    acc['purpose_info'] = self.get_purpose_info(acc['purpose_uuid'])
            
            elif key_str == '1':
                if tx_type == 'x509_envelope':
                    acc['txn_inputs_hash'] = self.cbor_array_to_str(value)
                elif tx_type == 'cip36':
                    if isinstance(value, list):
                        delegations = []
                        for delegation in value:
                            if isinstance(delegation, list) and len(delegation) >= 2:
                                voting_key_str = self.cbor_array_to_str(delegation[0])
                                delegations.append({
                                    'voting_key': voting_key_str,
                                    'votePublicKey': str(self.get_public_key_address_string(voting_key_str)), # Storing bech32 of public key
                                    'weight': delegation[1]
                                })
                        acc[mapping['key']] = delegations
                elif tx_type == 'cip15':
                    voting_key_str = self.cbor_array_to_str(value)
                    acc['voter_delegations'] = [
                        {
                            'voting_key': voting_key_str,
                            'votePublicKey': str(self.get_public_key_address_string(voting_key_str)),
                            'weight': 1,
                        }
                    ]
            
            elif key_str == '2':
                if tx_type == 'x509_envelope':
                    acc['previous_transaction_id'] = self.cbor_array_to_str(value)
                else:
                    stake_key_str = self.cbor_array_to_str(value)
                    stake_info = self.get_stake_key_info(stake_key_str, self.get_network())
                    acc['stake_pub'] = str(self.get_public_key_address_string(stake_key_str)) # original was getPublicKey().to_bech32()
                    # Wait, in the original TS code:
                    # acc['stake_pub'] = this.getPublicKey(this.cborArrayToStr(metadata[key])).to_bech32();
                    # But getPublicKey returns a PublicKey, which doesn't have to_bech32() in CSL directly unless it's an address?
                    # Ah, in CSL PublicKey can act as a key hash for credential?
                    # The original code did: getPublicKey(..).to_bech32(). 
                    # PublicKey in CSL has to_bech32()? 
                    # Actually PublicKey doesn't usually have to_bech32() method in CSL JS. 
                    # It might be casting to something else or the snippet had a helper?
                    # Re-reading user request source:
                    # this.getPublicKey(...).to_bech32() 
                    # It seems unusual. Maybe it meant hash().to_bech32('ed25519_pk')? 
                    # Or maybe it's converting the key to a bech32 string representation like 'ed25519_pk1...'?
                    
                    # In pycardano, VerificationKey can be encoded to bech32.
                    
                    acc['stake_hex'] = stake_info['stake_hex']
                    acc['stake_key'] = stake_info['stake_key']
            
            elif key_str == '3':
                if tx_type != 'x509_envelope':
                    reward_addr_bytes = bytes.fromhex(self.cbor_array_to_str(value))
                    try:
                        reward_address = Address.from_primitive(reward_addr_bytes)
                        acc['payment_address'] = str(reward_address)
                    except Exception as e:
                        logger.error(f"Failed to parse payment address: {e}")
                        acc['payment_address'] = None

            elif key_str == '4':
                if tx_type != 'x509_envelope':
                    acc['nonce'] = value
            
            elif key_str == '5':
                if tx_type != 'x509_envelope':
                    acc['voting_purpose'] = value
            
            elif key_str in ['10', '11', '12']:
                if tx_type == 'x509_envelope':
                    compression_type = 'raw'
                    if key_str == '11':
                        compression_type = 'brotli'
                    elif key_str == '12':
                        compression_type = 'zstd'
                    
                    acc['x509_data'] = self.parse_x509_chunked_data(value, compression_type)
                    acc['compression_type'] = compression_type
            
            elif key_str == '99':
                if tx_type == 'x509_envelope':
                    acc['validation_signature'] = self.cbor_array_to_str(value)
            
            else:
                if mapping and isinstance(mapping, str):
                    acc[mapping] = value
                elif mapping and isinstance(mapping, dict) and 'key' in mapping:
                    acc[mapping['key']] = value

        acc['txType'] = tx_type

        if tx_type == 'x509_envelope' and acc.get('x509_data') and acc['x509_data'].get('parsed_rbac'):
            rbac_data = acc['x509_data']['parsed_rbac']

            if rbac_data.get('stake_key'):
                variants = self.get_stake_address_variants_from_stake_bech(rbac_data['stake_key'])
                acc['stake_key'] = variants['stake_key']
                acc['stake_hex'] = variants['stake_hex']
                acc['stake_pub'] = rbac_data['stake_key']
            
            if 'voter_delegations' in rbac_data:
                acc['voter_delegations'] = rbac_data['voter_delegations']
            
            if 'payment_address' in rbac_data:
                acc['payment_address'] = rbac_data['payment_address']
            
            if 'nonce' in rbac_data:
                acc['nonce'] = rbac_data['nonce']

            if 'voting_purpose' in rbac_data:
                acc['voting_purpose'] = rbac_data['voting_purpose']

            acc['x509_envelope'] = {
                'purpose_uuid': acc.get('purpose_uuid'),
                'purpose_info': acc.get('purpose_info'),
                'txn_inputs_hash': acc.get('txn_inputs_hash'),
                'previous_transaction_id': acc.get('previous_transaction_id'),
                'validation_signature': acc.get('validation_signature'),
                'compression_type': acc.get('compression_type'),
                'roles': rbac_data.get('roles', [])
            }

        return acc

    def get_purpose_info(self, purpose_uuid: str) -> Dict[str, Any]:
        known_purposes = {
            'ca7a1457-ef9f-4c7f-9c74-7f8c4a4cfa6c': 'Project Catalyst User Role Registrations',
            'ca7ad312-a19b-4412-ad53-2a36fb14e2e5': 'Project Catalyst Admin Role Registrations',
        }

        uuid_str = self.hex_to_uuid(purpose_uuid)

        return {
            'uuid': uuid_str,
            'description': known_purposes.get(uuid_str, 'Unknown purpose'),
            'is_catalyst': uuid_str.startswith('ca7a'),
            'is_known': uuid_str in known_purposes,
        }

    def hex_to_uuid(self, hex_str: str) -> str:
        if len(hex_str) == 32:
            return f"{hex_str[0:8]}-{hex_str[8:12]}-{hex_str[12:16]}-{hex_str[16:20]}-{hex_str[20:32]}"
        return hex_str

    def parse_x509_chunked_data(self, chunks: List[Any], compression_type: str) -> Dict[str, Any]:
        try:
            reconstructed_data = self.reconstruct_chunked_data(chunks)
            decompressed_data = None

            if compression_type == 'raw':
                decompressed_data = reconstructed_data
            elif compression_type == 'brotli':
                decompressed_data = self.decompress_brotli(reconstructed_data)
            elif compression_type == 'zstd':
                decompressed_data = self.decompress_zstd(reconstructed_data)
            else:
                raise ValueError(f"Unknown compression type: {compression_type}")
            
            parsed_rbac = self.decode_rbac_structure(decompressed_data)

            return {
                'data': decompressed_data,
                'parsed_rbac': parsed_rbac
            }
        except Exception as e:
            logger.error(f"Failed to parse x509 chunked data: {e}")
            return {
                'error': f"Failed to parse x509 chunked data: {str(e)}",
                'compression': compression_type
            }

    def reconstruct_chunked_data(self, chunks: List[Any]) -> str:
        return "".join([self.cbor_array_to_str(chunk) for chunk in chunks])

    def decompress_brotli(self, compressed_hex: str) -> str:
        try:
            compressed_bytes = bytes.fromhex(compressed_hex)
            decompressed_bytes = brotli.decompress(compressed_bytes)
            return decompressed_bytes.hex()
        except Exception as e:
            logger.error(f"Brotli decompression failed: {e}")
            return compressed_hex

    def decompress_zstd(self, compressed_hex: str) -> str:
        try:
            compressed_bytes = bytes.fromhex(compressed_hex)
            dctx = zstd.ZstdDecompressor()
            decompressed_bytes = dctx.decompress(compressed_bytes)
            return decompressed_bytes.hex()
        except Exception as e:
            logger.error(f"Zstd decompression failed: {e}")
            return compressed_hex

    def decode_rbac_structure(self, rbac_data_hex: str) -> Dict[str, Any]:
        try:
            rbac_bytes = bytes.fromhex(rbac_data_hex)
            decoded_rbac = cbor2.loads(rbac_bytes)

            result = {
                'structure_type': 'cbor_map',
                'map_keys': list(decoded_rbac.keys()),
                'extracted_data': {},
                'stake_key': None,
                'payment_address': None,
                'voter_delegations': None,
                'roles': [],
            }

            for key, value in decoded_rbac.items():
                if key == 10:
                    if isinstance(value, list) and len(value) > 0:
                        cert_data = self.parse_x509_certificate(value[0])
                        result['extracted_data']['certificate'] = cert_data
                        if cert_data.get('stake_address'):
                            result['stake_key'] = cert_data['stake_address']
                
                elif key == 30:
                    result['extracted_data']['key_30'] = value
                
                elif key == 100:
                    if isinstance(value, list) and len(value) > 0 and isinstance(value[0], dict):
                         result['extracted_data']['role_data'] = self.parse_role_map(value[0])

            return result

        except Exception as e:
            logger.error(f"Failed to decode RBAC structure: {e}")
            return {'error': str(e)}

    def parse_x509_certificate(self, cert_bytes: bytes) -> Dict[str, Any]:
        try:
            cert_hex = cert_bytes.hex()
            has_valid_start = cert_hex.startswith('30820')
            
            cert_str = ""
            try:
                cert_str = cert_bytes.decode('utf-8', errors='ignore')
            except:
                pass
            
            cardano_match = re.search(r'web\+cardano://addr/(stake[a-z0-9]+)', cert_str)
            
            stake_address = None
            if cardano_match:
                raw_stake = cardano_match.group(1)
                # Mimic TS: slice(0, length - 1)
                if raw_stake:
                    stake_address = raw_stake[:-1]

            return {
                'length': len(cert_bytes),
                'has_asn1_structure': has_valid_start,
                'cardano_uri_found': bool(cardano_match),
                'stake_address': stake_address,
            }
        except Exception as e:
            return {'error': str(e)}

    def parse_role_map(self, role_map: Dict[Any, Any]) -> Dict[str, Any]:
        try:
            parsed = {
                'role_assignments': {},
                'signing_key_ref': None,
                'payment_key_ref': None,
            }

            for key, value in role_map.items():
                if key == 0:
                    parsed['role_assignments'][0] = value
                elif key == 1:
                    if isinstance(value, list) and len(value) == 2:
                        parsed['signing_key_ref'] = {
                            'certificate_index': value[0],
                            'key_index': value[1]
                        }
                elif key == 3:
                     parsed['payment_key_ref'] = value
                else:
                    parsed['role_assignments'][key] = value
            
            return parsed
        except Exception as e:
             return {'error': str(e)}

    def get_public_key_address_string(self, cbor_hex: str) -> str:
        """
        Equivalent to getPublicKey(cbor).to_bech32() in the original script.
        This assumes the bytes correspond to a VerificationKey.
        """
        try:
            cbor_str = self.cbor_array_to_str(cbor_hex)
            key_bytes = bytes.fromhex(cbor_str)
            # Try to assume it's a VerificationKey (Ed25519)
            vk = PaymentVerificationKey.from_primitive(key_bytes)
            return str(vk)
        except Exception as e:
            logger.error(f"{e} on : {cbor_hex}")
            raise ValueError("Invalid public key")

    def get_stake_key_info(self, key_pub: str, network: Network) -> Dict[str, str]:
        # key_pub is hex string of the public key
        try:
            key_bytes = bytes.fromhex(self.cbor_array_to_str(key_pub))
            # Create a StakeVerificationKey
            stake_vk = StakeVerificationKey.from_primitive(key_bytes)
            
            
            stake_credential = stake_vk.hash()
            address = Address(staking_part=stake_credential, network=network)
            
            return {
                'stake_hex': address.to_primitive().hex(), # or address.bytes.hex()
                'stake_key': str(address), # bech32
            }
        except Exception as e:
            logger.error(f"Error getting stake key: {e}")
            raise ValueError("Invalid stake key")

    def get_stake_address_variants_from_stake_bech(self, stake_bech: str) -> Dict[str, str]:
        try:
            address = Address.from_primitive(stake_bech)
            return {
                'stake_hex': address.to_primitive().hex(),
                'stake_key': stake_bech,
            }
        except:
             return {'stake_hex': '', 'stake_key': stake_bech}

    def cbor_array_to_str(self, byte_str: Union[str, bytes]) -> str:
        if isinstance(byte_str, bytes):
            return byte_str.hex()
        if isinstance(byte_str, str):
            if byte_str.startswith('0x'):
                return byte_str[2:]
            return byte_str
        return str(byte_str)



def json_serial(obj):
    """JSON serializer for objects not serializable by default json code"""
    if isinstance(obj, (set, bytes)):
         return str(obj)
    if hasattr(obj, 'to_primitive'):
         return obj.to_primitive()
    # Check for cbor2 undefined
    if obj is cbor2.undefined:
         return None
    
    return str(obj)

if __name__ == "__main__":
    try:
        # Read from stdin
        input_data = sys.stdin.read()
        if not input_data:
            print(json.dumps({"error": "No input provided"}))
            sys.exit(1)
        
        raw_tx = json.loads(input_data)
        
        service = TransactionsService()
        result = service.decode_transaction(raw_tx)
        
        # use custom serializer
        print(json.dumps(result, default=json_serial))
    except Exception as e:
        # also use custom serializer for error just in case exc contains weird stuff
        print(json.dumps({"error": str(e)}, default=json_serial))
        sys.exit(1)

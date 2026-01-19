# Catalyst Identity & Key System Architecture

## 1. The Core Concept: Sovereign Off-Chain Identity
The system separates **Identity** from **Value (Funds)**.
- **Payment Keys** (Cardano Wallet) hold funds ($ADA).
- **Catalyst Keys** (Off-Chain) represent identity and voting power.

This separation allows for key rotation and security upgrades without moving funds.

## 2. Key Hierarchy (Derivation)
Keys are generated deterministically from a wallet's **Recovery Phrase (Seed)**. It uses a standard hierarchy where "Roles" and "Versions" are defined by the path.

*   **Role 0 (Master Identity)**: The root key that controls the identity.
*   **Role 1+ (Delegated Roles)**: Keys for specific tasks (like Voting).

The system uses **Indices** for versioning:
*   `Index 0` -> **Initial Key**
*   `Index 1` -> **1st Rotation**
*   `Index 2` -> **2nd Rotation**

## 3. On-Chain Registration (The Anchor)
To make the off-chain identity "real," it is anchored to the Cardano blockchain via a **Registration Transaction**.

*   This transaction contains a standardized metadata packet.
*   It links the **Stake Address** (funds) to the **Catalyst Public Keys** (identity).
*   **Proof of Ownership**: The transaction is signed by the Payment Key (to pay fees) AND contains a digital signature from the Catalyst Key (to prove ownership of the identity).

## 4. Key Rotation (Versioning)
In this system, keys are never "replaced"; they are appended to history.

1.  **Generate** the next key in the sequence.
2.  **Submit** a new Registration Transaction.
3.  **Link**: The new transaction explicitly points back to the **Previous Transaction Hash** (unless it is the Root).

This creates an unbreakable **Chain of Custody** on the blockchain:
`Tx 1 (Root) <- Tx 2 (Update) <- Tx 3 (Latest)`

## 5. Tracing & Verification
To verify an identity, the logic is:

1.  **Start at the Stake Address**: "Which identity does this wallet claim?"
2.  **Find the Latest Registration**: "What is the most recent update?"
3.  **Trace Backwards**: "Does this update cryptographically link back to the original Root transaction?"

If the chain is unbroken and all signatures are valid, the current identity is verified.

#!/bin/bash
set -e

# Define constants
OURA_COMMIT_REV='2c3cf32356234168c0070fae9c6aef3ca96c93bf'
CARP_REPO="https://github.com/dcSpark/carp.git"
TARGET_COMMIT_REV="c4f352201d6dded94426bf819fb41a08335456d1"
SUBMODULE_PATH="./carp"
MODIFICATIONS_PATH='./config/carp'
MIGRATION_LINE_26='mod m20250210_000022_create_catalyst_transaction_table;'
MIGRATION_LINE_57='            Box::new(m20250210_000022_create_catalyst_transaction_table::Migration),'
ENTITY_LAST_LINE='pub mod catalyst_txn;'
TASK_LAST_LINE='pub mod catalyst;'
PRELUDE_LINE_64='pub use super::catalyst_txn::{\n    ActiveModel as CatalystTransactionActiveModel, Column as CatalystTransactionColumn, Entity as CatalystTransaction,\n    Model as CatalystTransactionModel, PrimaryKey as CatalystTransactionPrimaryKey,\n    Relation as CatalystTransactionRelation,\n};'
ERA_COMMON_FN_LINE_296="pub async fn catalyst_txns_from_hashes(
    db_tx: &DatabaseTransaction,
    hashes: &[Vec<u8>],
) -> Result<Vec<CatalystTransactionModel>, DbErr> {
    // Similar to transactions_from_hashes but for CatalystTransaction
    CatalystTransaction::find()
        .filter(CatalystTransactionColumn::Hash.is_in(hashes.iter().cloned()))
        .order_by_asc(CatalystTransactionColumn::Id)
        .all(db_tx)
        .await
}"
EXECUTION_CONTEXT_LINE_26='  (catalyst_txs) => { Vec<CatalystTransactionModel> };'

# Check if directory exists and has expected content
check_directory() {
    local dir=$1
    if [ ! -d "$dir" ]; then
        echo "Error: Directory $dir does not exist"
        return 1
    fi
    return 0
}

# Function to verify file exists before modifying
verify_file() {
    local file=$1
    if [ ! -f "$file" ]; then
        echo "Warning: File $file does not exist"
        return 1
    fi
    return 0
}

# Function to safely add content to a file
append_to_file() {
    local file=$1
    local content=$2
    if verify_file "$file"; then
        printf "%s\n" "$content" >> "$file"
        echo "Successfully appended to $file"
    fi
}

# Function to safely add content at specific line
insert_at_line() {
    local file=$1
    local line_num=$2
    local content=$3
    
    if verify_file "$file"; then
        # Check if line number exists
        if [ "$(wc -l < "$file")" -ge "$line_num" ]; then
            # Use a temp file to avoid issues with sed in-place edits
            local temp_file=$(mktemp)
            head -n $((line_num-1)) "$file" > "$temp_file"
            echo -e "$content" >> "$temp_file"
            tail -n +${line_num} "$file" >> "$temp_file"
            mv "$temp_file" "$file"
            echo "Successfully inserted at line $line_num in $file"
        else
            echo "ERROR: Line $line_num does not exist in $file"
            echo "File only has $(wc -l < "$file") lines"
            echo "NOT inserting content as it must go at the exact specified line"
            echo "Please check the file structure and update the script accordingly"
            return 1
        fi
    fi
}

echo "Starting CARP repository clone and modification script..."

# Check if carp is already cloned
if [ -d "$SUBMODULE_PATH" ]; then
    echo "Carp already exists at $SUBMODULE_PATH"
    echo "if attempting to re-clone, run the reset script found in this same directory"
    # exit with success to avoid breaking the CI pipeline
    exit 0
fi

# 1. Clone CARP
echo "Setting up CARP from $CARP_REPO..."
git clone "$CARP_REPO" "$SUBMODULE_PATH"

# 2. Checkout to the target commit
echo "Checking out target commit: $TARGET_COMMIT_REV"
cd "$SUBMODULE_PATH"
git checkout "$TARGET_COMMIT_REV"
cd ..

# 3. Remove .git directory after checkout is complete
echo "Removing .git directory from carp..."
rm -rf "$SUBMODULE_PATH/.git"


# 3. Apply modifications
echo "Applying modifications to CARP repository..."

# # 3.1. Delete webserver, docs, deployment files
# echo "Removing unnecessary directories..."
# rm -rf "$SUBMODULE_PATH/webserver" "$SUBMODULE_PATH/docs" "$SUBMODULE_PATH/deployment"

# 3.2. Replace execution_plans with the one in the modifications dir
echo "Replacing execution plans..."
if [ -d "$MODIFICATIONS_PATH/modules/execution_plans" ]; then
    rm -rf "$SUBMODULE_PATH/indexer/execution_plans"
    cp -r "$MODIFICATIONS_PATH/modules/execution_plans" "$SUBMODULE_PATH/indexer/"
    echo "Copied execution plans successfully"
else
    echo "Warning: Execution plans directory not found at $MODIFICATIONS_PATH/modules/execution_plans"
fi

# 3.3. Copy configs from modifications to indexer dir
echo "Copying configuration files..."
if [ -d "$MODIFICATIONS_PATH/configs" ]; then
    rm -rf "$SUBMODULE_PATH/indexer/configs"
    cp -r "$MODIFICATIONS_PATH/configs" "$SUBMODULE_PATH/indexer/"
    echo "Copied configs successfully"
else
    echo "Warning: Configs directory not found at $MODIFICATIONS_PATH/configs"
fi

# 3.3.5.1 Copy script dir from modifications to indexer dir
echo "Copying script files..."
if [ -d "$MODIFICATIONS_PATH/scripts" ]; then
    mkdir -p "$SUBMODULE_PATH/scripts"
    cp -r "$MODIFICATIONS_PATH/scripts"/* "$SUBMODULE_PATH/scripts/"
    echo "Copied scripts successfully"
else
    echo "Warning: Scripts directory not found at $MODIFICATIONS_PATH/scripts"
fi
# 3.3.5.9 Copy snapshots dir from modifications to indexer dir
echo "Copying snapshot queries..."
if [ -d "$MODIFICATIONS_PATH/snapshots" ]; then
    mkdir -p "$SUBMODULE_PATH/snapshots"
    cp -r "$MODIFICATIONS_PATH/snapshots"/* "$SUBMODULE_PATH/snapshots/"
    echo "Copied snapshots successfully"
else
    echo "Warning: Snapshots directory not found at $MODIFICATIONS_PATH/snapshots"
fi

# 3.4. Copy env testing to indexer dir
echo "Copying environment testing files..."
if [ -f "$MODIFICATIONS_PATH/secrets/.env.testing" ]; then
    cp "$MODIFICATIONS_PATH/secrets/.env.testing" "$SUBMODULE_PATH/indexer/"
    echo "Copied .env.testing successfully"
else
    echo "Warning: .env.testing file not found at $MODIFICATIONS_PATH/secrets/.env.testing"
fi

# 3.4.5 Replace Dockerfile
echo "Replacing Dockerfile..."
if [ -f "$MODIFICATIONS_PATH/Dockerfile" ]; then
    rm -f "$SUBMODULE_PATH/Dockerfile"
    cp "$MODIFICATIONS_PATH/Dockerfile" "$SUBMODULE_PATH/"
    echo "Copied Dockerfile successfully"
else
    echo "Warning: Dockerfile not found at $MODIFICATIONS_PATH/Dockerfile"
fi
# 3.4.6 Replace cardano.rs sink
echo "Replacing Cardano sink..."
if [ -f "$MODIFICATIONS_PATH/modules/sinks/cardano.rs" ]; then
    # rename the current cardano.rs file to cardano_legacy.rs
    mv "$SUBMODULE_PATH/indexer/src/sinks/cardano.rs" "$SUBMODULE_PATH/indexer/src/sinks/cardano_legacy.rs"
    # Copy the new cardano.rs file
    cp "$MODIFICATIONS_PATH/modules/sinks/cardano.rs" "$SUBMODULE_PATH/indexer/src/sinks/"
    echo "Copied cardano.rs successfully"
else
    echo "Warning: Cardano sink file not found at $MODIFICATIONS_PATH/modules/sinks/cardano.rs"
fi

if [ -f "$SUBMODULE_PATH/indexer/Cargo.toml" ]; then
  echo 'cbor_event = { version = "2.4.0" }' >> "$SUBMODULE_PATH/indexer/Cargo.toml"
  echo "Added cbor_event dependency to Cargo.toml"
else
  echo "Warning: Cargo.toml not found at $SUBMODULE_PATH/indexer/Cargo.toml"
fi

# 3.5. Handle migration files
echo "Setting up migration files..."
# Check if migration directory exists with the right name (migration vs migrations)
MIGRATION_DIR=""
if [ -d "$SUBMODULE_PATH/indexer/migration" ]; then
    MIGRATION_DIR="$SUBMODULE_PATH/indexer/migration"
elif [ -d "$SUBMODULE_PATH/indexer/migrations" ]; then
    MIGRATION_DIR="$SUBMODULE_PATH/indexer/migrations"
else
    echo "Error: Cannot find migration or migrations directory in $SUBMODULE_PATH/indexer/"
    echo "Listing available directories:"
    ls -la "$SUBMODULE_PATH/indexer/"
fi

if [ -n "$MIGRATION_DIR" ]; then
    echo "Found migration directory at: $MIGRATION_DIR"
    
    if [ -f "$MODIFICATIONS_PATH/modules/migrations/m20250210_000022_create_catalyst_transaction_table.rs" ]; then
        # Copy migration file
        cp "$MODIFICATIONS_PATH/modules/migrations/m20250210_000022_create_catalyst_transaction_table.rs" "$MIGRATION_DIR/src/"
        echo "Copied migration file successfully"
        
        # Add to lib.rs file
        if [ -f "$MIGRATION_DIR/src/lib.rs" ]; then
            # Get the number of lines in the file to handle insertion correctly
            total_lines=$(wc -l < "$MIGRATION_DIR/src/lib.rs")
            
            # Ensure we don't try to insert beyond the file length
            if [ "$total_lines" -ge 26 ]; then
                insert_at_line "$MIGRATION_DIR/src/lib.rs" 26 "$MIGRATION_LINE_26"
            else
                echo "ERROR: lib.rs has fewer than 26 lines, cannot insert at line 26"
            fi
            
            if [ "$total_lines" -ge 57 ]; then
                insert_at_line "$MIGRATION_DIR/src/lib.rs" 57 "$MIGRATION_LINE_57"
            else
                echo "ERROR: lib.rs has fewer than 57 lines, cannot insert at line 57"
            fi
        else
            echo "Error: lib.rs not found in $MIGRATION_DIR/src/"
        fi
    else
        echo "Warning: Migration file not found at $MODIFICATIONS_PATH/modules/migrations/m20250210_000022_create_catalyst_transaction_table.rs"
    fi
else
    echo "Skipping migration setup due to missing directories"
fi

# 3.6. Handle entity files
echo "Setting up entity files..."
if [ -f "$MODIFICATIONS_PATH/modules/models/catalyst_txn.rs" ]; then
    # Copy entity file
    cp "$MODIFICATIONS_PATH/modules/models/catalyst_txn.rs" "$SUBMODULE_PATH/indexer/entity/src/"
    echo "Copied entity file successfully"
    
    # Append to last part of entity/src/lib.rs
    append_to_file "$SUBMODULE_PATH/indexer/entity/src/lib.rs" "$ENTITY_LAST_LINE"
else
    echo "Warning: Entity file not found at $MODIFICATIONS_PATH/modules/models/catalyst_txn.rs"
fi

# 3.6.5 Handle catalyst task files
echo "Setting up task files..."
if [ -d "$MODIFICATIONS_PATH/modules/tasks/catalyst" ]; then
    # Create the catalyst directory in the target location
    mkdir -p "$SUBMODULE_PATH/indexer/tasks/src/catalyst"
    
    # Copy all files from the catalyst directory
    cp -r "$MODIFICATIONS_PATH/modules/tasks/catalyst"/* "$SUBMODULE_PATH/indexer/tasks/src/catalyst/"
    echo "Copied catalyst task folder successfully"
    
    # Append to last part of indexer/tasks/src/lib.rs
    append_to_file "$SUBMODULE_PATH/indexer/tasks/src/lib.rs" "$TASK_LAST_LINE"
else
    echo "Warning: Catalyst task folder not found at $MODIFICATIONS_PATH/modules/tasks/catalyst"
fi

# 3.7. Append to era_common.rs
echo "Modifying era_common.rs..."
append_to_file "$SUBMODULE_PATH/indexer/tasks/src/era_common.rs" "$ERA_COMMON_FN_LINE_296"

# 3.8. Add to prelude file
echo "Modifying prelude.rs..."
if verify_file "$SUBMODULE_PATH/indexer/entity/src/prelude.rs"; then
    # Get the number of lines in the file
    total_lines=$(wc -l < "$SUBMODULE_PATH/indexer/entity/src/prelude.rs")
    
    if [ "$total_lines" -ge 64 ]; then
        insert_at_line "$SUBMODULE_PATH/indexer/entity/src/prelude.rs" 64 "$PRELUDE_LINE_64"
    else
        echo "ERROR: prelude.rs has fewer than 64 lines, cannot insert at line 64"
    fi
fi

# 3.9. Add to execution_context file
echo "Modifying execution_context.rs..."
if verify_file "$SUBMODULE_PATH/indexer/tasks/src/dsl/execution_context.rs"; then
    # Get the number of lines in the file
    total_lines=$(wc -l < "$SUBMODULE_PATH/indexer/tasks/src/dsl/execution_context.rs")
    
    if [ "$total_lines" -ge 26 ]; then
        insert_at_line "$SUBMODULE_PATH/indexer/tasks/src/dsl/execution_context.rs" 26 "$EXECUTION_CONTEXT_LINE_26"
    else
        echo "ERROR: execution_context.rs has fewer than 26 lines, cannot insert at line 26"
    fi
fi

# 3.10. Replace oura rev hash in Cargo.toml
echo "Updating oura dependency in Cargo.toml..."
if verify_file "$SUBMODULE_PATH/indexer/Cargo.toml"; then
    # Use grep to check if pattern exists before replacing
    if grep -q "oura = { git = \"https://github.com/txpipe/oura.git\"" "$SUBMODULE_PATH/indexer/Cargo.toml"; then
        # Use perl for more reliable regex replacement
        perl -i -pe "s|oura = \{ git = \"https://github.com/txpipe/oura.git\", rev = \"[^\"]*\" \}|oura = { git = \"https://github.com/txpipe/oura.git\", rev = \"$OURA_COMMIT_REV\" }|g" "$SUBMODULE_PATH/indexer/Cargo.toml"
        echo "Updated oura dependency to use commit rev: $OURA_COMMIT_REV"
    else
        echo "Warning: Could not find oura dependency pattern in Cargo.toml"
    fi
else
    echo "Warning: Cargo.toml file not found at $SUBMODULE_PATH/indexer/Cargo.toml"
fi

echo "CARP modifications complete!"
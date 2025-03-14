# Remove the submodule entry from .git/config
git submodule deinit -f ./carp

# Remove the submodule from the working tree and index
git rm -f ./carp

# Remove the submodule directory from .git/modules
rm -rf .git/modules/carp

# Remove any leftover directory (if git rm didn't remove it)
rm -rf ./carp ./gitmodules

echo "carp submodule removed"
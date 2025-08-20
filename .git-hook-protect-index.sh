#!/usr/bin/sh
#
# Don't use with https://github.com/pre-commit/pre-commit, and don't symlink to this file from
# .git/hooks/pre-commit, because this file exists main but not on source-only branch. Instead, copy
# this file to .git/hooks/pre-commit

if git merge-base --is-ancestor main HEAD; then
    if git diff --cached --name-only | grep -q "^index.js$"; then
        echo "Don't commit changes to index.js on main branch. Use source-only branch first."
        exit 1
    fi
elif git merge-base --is-ancestor source-only HEAD; then
    # We don't even have .gitignore on source-only branch. So when we switch to it from main branch,
    # let's prevent accidental commit of node_modules or any files from the developer's IDE.
    if git diff --cached --name-only | grep --invert-match -q "^index.js$"; then
        echo "Don't commit any files other than index.js on source-only branch. Use main branch."
        exit 1
    fi
fi
exit 0

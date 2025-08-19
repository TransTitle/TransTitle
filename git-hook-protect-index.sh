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
fi
exit 0

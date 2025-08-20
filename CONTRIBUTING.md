# Standards and conventions

## Quality

- Use JSDoc.
- Write tests. In TypeScript.

## GIT and pull requests

Commit changes to `index.js` only on a `source-only`-based branch. Changes to any other files on a
`main`-based branch.

After you clone the repository, set up a pre-commit hook. (We do **not** use
[pre-commit/pre-commit](https://github.com/pre-commit/pre-commit) or use a symlink, because we don't
keep our pre-commit script on `source-only` branch to keep it slim.) Run the following on a
`main`-based branch:
```bash
cp .git-hook-protect-index.sh .git/hooks/pre-commit
```

### Pull requests

We only accept pull requests that are rebased on the appropriate branch (`main` or `source-only`,
see below), and are up-to-date. We do not "merge" pull requests, because it adds GIT history noise.

### Easier - if you can remove your branch afterwards

This should not be a problem if you've created a dedicated branch for your pull request, based on
`main` branch.

Create one pull request against (based on) `main` branch. However, have changes to `index.js`
separate from changes to/additions of any tests or any other files - have them in two separate
commits.

Maintainer's steps:

```bash
git fetch upstream user-branch

#--------
# If the user committed `index.js
git checkout user-branch
git log
# \---> note the commit hash as "user-index.js-commit" below

git checkout source-only
git cherry-pick user-index.js-commit
# \---> note the commit hash as "upstream-source-only-commit" below
git push upstream

git checkout main
git cherry-pick upstream-source-only-commit
git push upstream
#--------

#--------
# If the user committed files other than `index.js
git checkout user-branch
git log
# \---> note the commit hash as "user-other-files-commit"

git checkout main
git cherry-pick user-other-files-commit
git push upstream
```

### Harder - if you need your branch(es) afterwards

Purpose: This is only if you need to keep using your branch(es) afterwards, and you believe the pull
request will be accepted with no modifications.

Limitations
- If you are changing both `index.js` and any other file (or changing `index.js` and
  adding/removing/moving any other file), you'll need to create two pull requests.
- If there are any other changes committed to the upstream since you've created your branches,
  you'll need to rebase and `git push --force` your branch(es).

What to do
- If you are changing `index.js`, create a branch and pull request based on `source-only` branch.
- If you are changing or adding any other file, create a branch and pull request based on `main`
  branch.

Maintainer's steps:

```bash
#--------
# If the user committed to her source-only branch (changes to index.js)
git fetch upstream user-source-only-branch
git checkout user-source-only-branch
git log
# \---> note the commit hash as "user-index.js-commit" below

git checkout source-only
git cherry-pick user-index.js-commit
# \---> note the commit hash as "upstream-source-only-commit" below
git push upstream

git checkout main
git cherry-pick upstream-source-only-commit
git push upstream
#--------

#--------
# If the user committed files to her main-branch (files other than `index.js)
git fetch upstream user-main-branch
git checkout user-main-branch
git log
# \---> note the commit hash as "user-other-files-commit"

git checkout main
git cherry-pick user-other-files-commit
git push upstream
```

### Code formatting

- Wrapping lines to 100 characters (inspired by Rust).
- Suggest [ReWrap Revived](https://marketplace.visualstudio.com/items?itemName=dnut.rewrap-revived)
  ([dnut/Rewrap](https://github.com/dnut/Rewrap/)).
- Please upvote [dnut/Rewrap/issues/32](https://github.com/dnut/Rewrap/issues/32) ("Breaking
  backticked string literals containing a space").
- We use [js-beautify](https://github.com/beautifier/js-beautify)
  ([beautifier.io](https://beautifier.io/)), because it's less opinionated/more configurable than
  [prettier.io](https://prettier.io/).
  - Our only extra configuration (on top of defaults) is to keep an empty line at the end of files.
    (In addition to it being needed by some tools, this improves GIT diffs when adding content to
    the end of a file.)
  - ```
    npx js-beautify -r index.js
    npx js-beautify -r tests/*
    ```

## Other than technical
### International (American) English

- We love Commonwealth/Irish... spelling - but we don't use it here.
- No high Latin either (plurals or other), so for example, for plural of "index" we don't use
  "indices", but "indexes".

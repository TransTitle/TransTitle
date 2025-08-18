# Standards and conventions

## Quality

- Use JSDoc.
- Write tests. In TypeScript.

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

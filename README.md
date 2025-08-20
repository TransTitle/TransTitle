# TransTitle

[TransTitle](https://github.com/TransTitle/TransTitle/) 

## Implementation

TransTitle is written in pure Javascript, but with [JSDoc](https://jsdoc.app/) type annotations.
That eliminates a need for any extra processing, so it can be used directly in browser extensions.

### Data organization

Redundant

Potential for consistency problems

### Code quality: Tests, type checks

Tests are written in TypeScript and run with
[ts-node-test](https://www.npmjs.com/package/ts-node-test). Running tests requires Node.js version
18 or newer.

Of course, we validate JSDoc-annotated types. But, we also enforce extra standards and perform extra
checks with [ESLint](eslint.org) (see [`eslint.config.js`](./eslint.config.js)).

- `npm install`
- `npm run check-types` - **before** `npm test`, as it reports type errors better
- `npx eslint`
- `npm test`

## GIT branches and source code location

- Two GIT branches:
  - [`source-only`](https://github.com/TransTitle/TransTitle/tree/source-only) contains `index.js`
    file only. Intended for GIT submodule or GIT subtree.
  - [`main`](https://github.com/TransTitle/TransTitle) also contains tests and documentation.
- Source code ()`index.js`) is at the top-level (rather than under `src/` or similar).
  - That is suitable for GIT submodule or GIT subtree.
  - Having it at the same location in both branches allows us to easily switch between `main` and
    `source-only` branches and apply its commits.

## TODO

### Initial sanitization
- If unsure whether it was sanitized already, fail on any special-char-followed-by-@ (@@, #@, <@,
  >@)
- Fail on any '#__# ' that is not followed by either
  - just a trailing space (after all highlights, and any of their comments, were deleted), or
  - by '<<'

Browser extensions
- Watch for add-bookmark event. If the title contains '#__#' but NOT from Yawas (like above), add a
  trailing '#__# '.
- Watch for modify-existing-bookmark event. Compare and sanitize/report.
- Search provider.
  - search
  - context menu option for bookmark folder to choose the folder or subtree where to search
  - use default bookmark folder (configurable and/or overridden by context menu option)

# @flowser/frontend

## Architecture

This app can be built as a website or a desktop app. The entry points for different targets are located in `src/targets` dir.

## Setup

### Running on Macbook M1

If you're using MacOS with M1 chip (arm64 architecture),
then `node-sqlite3` bindings won't be installed correctly.

During initial installation, `node-pre-gyp` will install `napi-v6-darwin-unknown-x64` (incorrect) bindings, but when running the app it will require (correct) `napi-v6-darwin-unknown-arm64` bindings - which won't be installed on your system, so you will get `module not found` error.

<details>
<summary>
Full "module not found" error log
</summary>

<pre>
[1] App threw an error during load
[1] Error: Cannot find module '/Users/bartkozorog/Projects/flowser/node_modules/sqlite3/lib/binding/napi-v6-darwin-unknown-arm64/node_sqlite3.node'
[1] Require stack:
[1] - /Users/bartkozorog/Projects/flowser/node_modules/sqlite3/lib/sqlite3-binding.js
[1] - /Users/bartkozorog/Projects/flowser/node_modules/sqlite3/lib/sqlite3.js
[1] - /Users/bartkozorog/Projects/flowser/web/public/main.js
[1] - /Users/bartkozorog/Projects/flowser/node_modules/electron/dist/Electron.app/Contents/Resources/default_app.asar/main.js
[1] -
[1]     at Module._resolveFilename (node:internal/modules/cjs/loader:940:15)
[1]     at n._resolveFilename (node:electron/js2c/browser_init:245:1105)
[1]     at Module._load (node:internal/modules/cjs/loader:785:27)
[1]     at c._load (node:electron/js2c/asar_bundle:5:13343)
[1]     at Module.require (node:internal/modules/cjs/loader:1012:19)
[1]     at require (node:internal/modules/cjs/helpers:102:18)
[1]     at Object.<anonymous> (/Users/bartkozorog/Projects/flowser/node_modules/sqlite3/lib/sqlite3-binding.js:4:17)
[1]     at Module._compile (node:internal/modules/cjs/loader:1120:14)
[1]     at Module._extensions..js (node:internal/modules/cjs/loader:1175:10)
[1]     at Module.load (node:internal/modules/cjs/loader:988:32)
</pre>
</details>


This issue is also described in [this StackOverflow post](https://stackoverflow.com/questions/72553650/how-to-get-node-sqlite3-working-on-mac-m1#answer-72571188). The solution for now is to manually build the correct `sqlite3` bindings on M1, with `yarn run install:m1` command.


### Automatic tasks

Some automatic tasks are running in the background:

1. ESlint (Run automatically on every commit via Git hooks & Husky)
2. Prettier (Run automatically on every commit via Git hooks & Husky)

Git hooks and Husky setup inspired by the following articles:

-   [Git hooks (Mono repo)](https://scottsauber.com/2021/06/01/using-husky-git-hooks-and-lint-staged-with-nested-folders/)
-   [Git hooks React setup](https://nickymeuleman.netlify.app/blog/git-hooks)
-   [EsLint & Prettier React](https://robertcooper.me/post/using-eslint-and-prettier-in-a-typescript-project)

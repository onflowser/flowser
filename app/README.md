# @flowser/app

This is a kinda hacky solution to the issues that we are experiencing when building electron app in a monorepo project.

Because of that, this is just a workaround solution for now.

## Building

1. Run `node scripts/setup.js` to prepare the workspace for building
2. Run `sh scrits/build.sh` to build the app 


## Context

The main seems to be that `electron-builder` isn't correctly resolving node packages in a monorepo environment with yarn workspaces.

While electron build still succeeds, the app throws a fatal runtime error `Module x not found` when opened.

This is because the dependencies from other packages (e.g. `@flowser/backend`) weren't included in the electron build artifact. 

## Solution

To solve this problem, we've created a merged `package.json` file, that combines dependencies from all other packages (currently `@flowser/backend` and `@flowser/frontend`) 
along with the `src/package.json` file, which acts as a template.

Then we need to install those packages to the `app/node_modules` directory without "hoisting" them to the project root - https://classic.yarnpkg.com/blog/2018/02/15/nohoist.

Electron builder should now correctly resolve those packages and include them in the build artifact.

## Related

- https://spectrum.chat/theia/general/monorepo-with-both-lerna-yarn-workspaces-and-electron-builder~663b407c-f857-4916-b2a4-f63b5c360460

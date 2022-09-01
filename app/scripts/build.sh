sh copy-build-artifacts.sh

# Note that some reason, electron-builder doesn't work with npx
# https://github.com/electron-userland/electron-builder/issues/3984
yarn run build-electron

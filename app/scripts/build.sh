BUILD_PATH=../build

# Cleanup
rm -rf $BUILD_PATH
mkdir -p $BUILD_PATH

# Copy build artifacts from other modules to this folder
cp -r ../../frontend/build ${BUILD_PATH}/react
cp -r ../../frontend/dist ${BUILD_PATH}/electron

# Note that some reason, electron-builder doesn't work with npx
# https://github.com/electron-userland/electron-builder/issues/3984

PLATFORM_ARG=$1 # valid values: --win, --mac, --linux

yarn run build-electron "${PLATFORM_ARG}"

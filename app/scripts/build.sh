BUILD_PATH=../build
# Needs to be set to the "buildResources" directory
# See https://www.electron.build/icons
APP_ICON_PATH=../build/react/static/app-icon

# Cleanup
rm -rf $BUILD_PATH
mkdir -p $BUILD_PATH

# Copy build artifacts from other modules to this folder
cp -r ../../frontend/build ${BUILD_PATH}/react
cp -r ../../frontend/dist ${BUILD_PATH}/electron

# Note that some reason, electron-builder doesn't work with npx
# https://github.com/electron-userland/electron-builder/issues/3984

PLATFORM_ARG=$1 # valid values: win, mac, linux, all

# The linux build fails if this directory doesn't exist
# For some reason it's not automatically created
mkdir ../release/build/@flowser

mkdir -p $APP_ICON_PATH

# Generate app icons
../node_modules/.bin/electron-icon-maker --input=../src/icon.png --output=$APP_ICON_PATH

yarn run "build-${PLATFORM_ARG}"

BUILD_PATH=../build

# Cleanup
rm -rf $BUILD_PATH
mkdir -p $BUILD_PATH

# Copy build artifacts from other modules to this folder
cp -r ../../frontend/build ${BUILD_PATH}/react
cp -r ../../frontend/dist ${BUILD_PATH}/electron

const path = require("path");

const appRootDir = path.join(__dirname, "..");
const envPath = path.join(appRootDir, ".env");

require("dotenv").config({
  path: envPath,
});

const { notarize } = require("electron-notarize");

exports.default = async function notarizing(context) {
  const { electronPlatformName, appOutDir } = context;
  if (electronPlatformName !== "darwin") {
    return;
  }

  const appleId = process.env.APPLE_ID;
  const appleIdPassword = process.env.APPLE_ID_PASS;
  if (!appleId) {
    throw new Error("Apple ID not set");
  }
  if (!appleIdPassword) {
    throw new Error("Apple ID password not set");
  }

  const appName = context.packager.appInfo.productFilename;

  return await notarize({
    appBundleId: "dev.flowser.app",
    appPath: `${appOutDir}/${appName}.app`,
    appleId,
    appleIdPassword,
  });
};

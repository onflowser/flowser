const fs = require("fs");
const path = require("path");

const appRootDir = path.join(__dirname, "..");
const backendRootDir = path.join(appRootDir, "..", "backend");
const frontendRootDir = path.join(appRootDir, "..", "frontend");

const backendPackageJson = readPackageFile(backendRootDir);
const frontendPackageJson = readPackageFile(frontendRootDir);

const mergedPackageJson = mergePackageJsonFiles(
  backendPackageJson,
  frontendPackageJson
);

fs.writeFileSync(
  path.join(appRootDir, "package.json"),
  JSON.stringify(mergedPackageJson, null, 2)
);

function readPackageFile(packageDir) {
  const data = fs.readFileSync(path.join(packageDir, "package.json"));
  return JSON.parse(data.toString());
}

function mergePackageJsonFiles(first, second) {
  const mergedDevDependencies = Object.assign(
    {},
    first.devDependencies,
    second.devDependencies
  );
  const mergedDependencies = Object.assign(
    {},
    first.dependencies,
    second.dependencies
  );

  return {
    name: "@flowser/app",
    version: "0.0.1",
    scripts: {
      "build-electron":
        "electron-builder -c.extraMetadata.main=build/electron/main.js",
    },
    dependencies: mergedDependencies,
    devPackages: mergedDevDependencies,
  };
}

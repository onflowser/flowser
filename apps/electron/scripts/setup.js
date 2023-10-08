const fs = require("fs");
const path = require("path");
const child_process = require("child_process");

const appRootDir = path.join(__dirname, "..");
const appSrcDir = path.join(appRootDir, "src");
const backendRootDir = path.join(appRootDir, "..", "backend");
const frontendRootDir = path.join(appRootDir, "..", "frontend");

const templatePackageJson = readPackageFile(appSrcDir);
const backendPackageJson = readPackageFile(backendRootDir);
const frontendPackageJson = readPackageFile(frontendRootDir);

(async function run() {
  const mergedPackageJson = mergePackageJsonFiles(
    templatePackageJson,
    backendPackageJson,
    frontendPackageJson
  );

  const flowserPackages = getFlowserPackages(mergedPackageJson);

  // Temporary remove flowser packages from package.json
  // Otherwise "yarn install" will fail
  for (const packageName in flowserPackages) {
    delete mergedPackageJson.dependencies[packageName];
  }

  writePackageFile(appRootDir, mergedPackageJson);

  await executeShellCommand("yarn", "install");

  const packageJsonAfterInstall = readPackageFile(appRootDir);
  packageJsonAfterInstall.dependencies = {
    ...packageJsonAfterInstall.dependencies,
    ...flowserPackages,
  };

  writePackageFile(appRootDir, packageJsonAfterInstall);
})();

function writePackageFile(packageDir, data) {
  fs.writeFileSync(
    path.join(packageDir, "package.json"),
    JSON.stringify(data, null, 2)
  );
}

function readPackageFile(packageDir) {
  const data = fs.readFileSync(path.join(packageDir, "package.json"));
  return JSON.parse(data.toString());
}

function executeShellCommand(command, options) {
  return new Promise((resolve, reject) => {
    const cmd = child_process.exec(command, options);
    cmd.stdin.on("data", (data) => {
      console.log(data.toString());
    });
    cmd.stderr.on("data", (data) => {
      console.log("ERROR", data.toString());
    });
    cmd.on("close", (code) => {
      console.log(`${command} exited with code ${code}`);
      if (code === 0) {
        resolve();
      } else {
        reject();
      }
    });
  });
}

function getFlowserPackages(packageJson) {
  const flowserMonorepoPackages = [
    "@flowser/backend",
    "@flowser/frontend",
    "@flowser/shared",
  ];

  return flowserMonorepoPackages.reduce(
    (object, packageName) => ({
      ...object,
      [packageName]: packageJson.dependencies[packageName],
    }),
    {}
  );
}

function mergePackageJsonFiles(templateFile, ...packageFiles) {
  const mergedDevDependencies = Object.assign(
    templateFile.devDependencies ?? {},
    ...packageFiles.map((file) => file.devDependencies)
  );
  const mergedDependencies = Object.assign(
    templateFile.dependencies ?? {},
    ...packageFiles.map((file) => file.dependencies)
  );

  return {
    ...templateFile,
    dependencies: mergedDependencies,
    devDependencies: mergedDevDependencies,
  };
}

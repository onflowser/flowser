const { exec } = require('child_process');
const https = require('https');
const fs = require('fs');
const os = require('os');
const { promisify } = require('util');

const execAsync = promisify(exec);

async function isGoInstalled() {
  try {
    const { stdout } = await execAsync('go version');
    console.log('Go is already installed:', stdout.trim());
    return true;
  } catch (error) {
    console.log('Go is not installed');
    return false;
  }
}

async function downloadFile(url, dest) {
  const file = fs.createWriteStream(dest);
  return new Promise((resolve, reject) => {
    https.get(url, (response) => {
      response.pipe(file);
      file.on('finish', () => {
        file.close();
        resolve(file);
      });
      file.on("error", (error) => {
        reject(error);
      })
    });
  });
}

function installGo(filePath) {
  return new Promise((resolve, reject) => {
    exec(`tar -C /usr/local -xzf ${filePath}`, async (error) => {
      if (error) {
        console.error('Error occurred:', error);
        return reject(error);
      }
      console.log('Go installed successfully');
      // Updating PATH to include Go (this will only affect this script's process)
      process.env.PATH += ':/usr/local/go/bin';
      const { stdout } = await execAsync('go version');
      console.log('Installed Go version:', stdout.trim());
      resolve();
    });
  })
}

async function main() {
  const goInstalled = await isGoInstalled();
  if (!goInstalled && os.platform() === "linux") {
    const goVersion = '1.19'; // Update this as needed
    const platform = 'linux-amd64';
    const url = `https://dl.google.com/go/go${goVersion}.${platform}.tar.gz`;
    const dest = `/tmp/go${goVersion}.${platform}.tar.gz`;
    await downloadFile(url, dest);
    await installGo(dest);
  }
}

main();

const { spawn } = require("child_process");

const cmd = process.argv[2];

const child = spawn(cmd || "main_linux_x86_64")

child.stdout.on("data", (data) => {
    console.log("stdout: ", data.toString())
})
child.on("close", (code) => {
    console.log(`Process exited with code: ${code}`)
});

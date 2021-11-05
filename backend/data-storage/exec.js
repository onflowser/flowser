const { exec } = require("child_process");

const cmd = process.argv[2];

exec(cmd || "main_linux_x86_64", {
    shell: "/bin/sh",
    maxBuffer: 10000,
}, console.log)

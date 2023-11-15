package main

import (
	"fmt"
	"os"

	"github.com/onflowser/flowser/v3/pkg/flowser"
)

func main() {
	if len(os.Args) < 3 {
		panic("Missing args. Usage: <command_name> <install_dir>")
	}

	commandName := os.Args[1]
	installDir := os.Args[2]

	app := flowser.New()

	switch commandName {
	case "install":
		if app.Installed(installDir) {
			fmt.Println("Already installed")
			os.Exit(0)
		}
		err := app.Install(installDir)
		if err != nil {
			panic(err)
		}

	case "run":
		if len(os.Args) != 4 {
			fmt.Println("Missing project dir arg")
			os.Exit(1)
		}
		projectDir := os.Args[3]
		err := app.Run(installDir, projectDir)

		if err != nil {
			panic(err)
		}
	}
}

package main

import (
	"fmt"
	"github.com/onflowser/flowser/pkg/flowser"
	"os"
	"path"
)

func main() {
	app := flowser.New()
	installDir := path.Join("..", "test-install")

	if !app.Installed(installDir) {
		err := app.Install(installDir)
		fmt.Println("Installing Flowser...")
		if err != nil {
			panic(err)
		}

	}

	projectDir := os.Args[1]
	fmt.Println("Running Flowser")
	app.Run(installDir, projectDir)
}

package main

import (
	"fmt"
	"github.com/onflowser/flowser/flowser"
)

func main() {
	app := &flowser.App{}

	location, err := app.Install("")
	if err != nil {
		panic(err)
	}

	fmt.Println("Flowser installed at:", location)
}

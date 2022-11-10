package main

import (
	"os"
	"testing"
)

var app = FlowserApp{platform: "darwin", installDir: "./test-install"}

func TestInstallAndRun(t *testing.T) {
	installDir, err := app.Install()
	defer os.RemoveAll(installDir)

	if err != nil {
		t.Fatalf("Installed with error %s", err)
	}
	isInstalled, err := app.IsInstalled()
	if err != nil {
		t.Fatalf("Installed with error %s", err)
	}
	if !isInstalled {
		t.Fatalf("Should return isInstalled = true")
	}
	err = app.Run("/invalid/path")
	if err == nil {
		t.Fatal("Didn't return error for invalid project path")
	}
}

func TestRemoval(t *testing.T) {
	isInstalled, err := app.IsInstalled()
	defer os.RemoveAll(app.installDir)

	if err != nil {
		t.Fatalf("Installed with error %s", err)
	}
	if !isInstalled {
		t.Log("Installing...")
		app.Install()
	}

	err = app.Remove()
	if err != nil {
		t.Fatalf("Failed to remove app: %s", err)
	}
}

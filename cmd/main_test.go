package main

import (
	"os"
	"testing"
)

var app = FlowserApp{platform: "darwin", installDir: "./test-install"}

func TestInstallAndRun(t *testing.T) {
	installDir, err := app.Install()
	defer os.Remove(installDir)

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
		t.Fatalf("Didn't return error for invalid project path")
	}
}

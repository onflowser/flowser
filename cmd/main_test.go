package main

import (
	"testing"
)

var app = FlowserApp{}

func TestInstallAndRun(t *testing.T) {
	installDir, err := app.Install()
	t.Logf("Installed to %s", installDir)

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

	err = app.Remove()
	if err != nil {
		t.Fatalf("Failed to remove installed app: %s", err)
	}
}

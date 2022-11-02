package main

import (
	"context"
	"fmt"
	"io"
	"log"
	"net/http"
	"os"
	"os/exec"
	"runtime"
	"strings"

	"github.com/google/go-github/github"
)

func IsInstalled() bool {
	_, err := os.Stat(getInstallDir())
	return !os.IsNotExist(err)
}

func Install() {
	assetDownloadPath := downloadLatestReleaseAsset()
	defer os.Remove(assetDownloadPath)
	switch runtime.GOOS {
	case "darwin":
		// Use native unzip tool as it handles the creation of required symbolic links
		cmd := exec.Command("unzip", assetDownloadPath, "-d", "/Applications")

		if out, err := cmd.CombinedOutput(); err != nil {
			log.Println(string(out))
			log.Fatal(err)
		}
	default:
		panic("Not implemented")
	}
}

func downloadLatestReleaseAsset() string {
	releaseAsset, releaseVersion := getLatestRelease()
	resp, _ := http.Get(*releaseAsset.BrowserDownloadURL)
	defer resp.Body.Close()

	out, _ := os.Create(*releaseAsset.Name)
	defer out.Close()

	log.Printf("Downloading latest Flowser release %s", releaseVersion)

	_, err := io.Copy(out, resp.Body)
	if err != nil {
		panic("Install failed")
	}

	return out.Name()
}

func getLatestRelease() (github.ReleaseAsset, string) {
	client := github.NewClient(nil)
	release, _, err := client.Repositories.GetLatestRelease(context.Background(), "onflowser", "flowser")
	if err != nil {
		log.Fatal(err)
	}
	latestVersion := strings.Replace(*release.TagName, "v", "", 1)
	for _, asset := range release.Assets {
		if *asset.Name == getAssetName(latestVersion) {
			return asset, latestVersion
		}
	}
	panic("No asset found")
}

func getAssetName(version string) string {
	isArm := strings.HasPrefix(runtime.GOARCH, "arm")
	switch runtime.GOOS {
	case "darwin":
		if isArm {
			return fmt.Sprintf("Flowser-%s-arm64-mac.zip", version)
		} else {
			return fmt.Sprintf("Flowser-%s-mac.zip", version)
		}
	default:
		panic("Not implemented")
	}
}

func getInstallDir() string {
	switch runtime.GOOS {
	case "darwin":
		return "/Applications/Flowser.app"
	default:
		panic("Not implemented")
	}
}

func Run(location string) {
	switch runtime.GOOS {
	case "darwin":
		runDarwin(location)
	default:
		panic("Not implemented")
	}
}

func runDarwin(location string) {
	cmd := exec.Command("/Applications/Flowser.app/Contents/MacOS/Flowser", fmt.Sprintf("--project-path=%s", location))
	if err := cmd.Run(); err != nil {
		log.Fatal(err)
	}
}

func main() {
	// TODO: Add proper error handling
	// TODO: Implement windows logic
	if IsInstalled() {
		log.Println("Flowser is already installed in /Applications/Flowser.app")
	} else {
		Install()
	}
	Run("/path/to/flow/project")
}

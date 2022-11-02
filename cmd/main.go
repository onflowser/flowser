package main

import (
	"context"
	"errors"
	"fmt"
	"io"
	"log"
	"net/http"
	"os"
	"os/exec"
	"os/user"
	"path"
	"runtime"
	"strings"

	"github.com/google/go-github/github"
)

func IsInstalled() bool {
	_, err := os.Stat(getExecutableFile())
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
	case "windows":
		if err := os.Mkdir(getInstallDir(), os.ModePerm); err != nil {
			log.Println("Failed to create install directory")
			log.Fatal(err)
		}

		// tar utility is available from Windows build 17063
		// TODO: consider using other command or a custom implementation
		// https://learn.microsoft.com/en-us/virtualization/community/team-blog/2017/20171219-tar-and-curl-come-to-windows
		cmd := exec.Command("tar", "-xf", assetDownloadPath, "-C", getInstallDir())

		if out, err := cmd.CombinedOutput(); err != nil {
			log.Println(string(out))
			log.Fatal(err)
		}
	default:
		panic("not implemented")
	}
}

func downloadLatestReleaseAsset() string {
	release, error := getLatestRelease()

	if error != nil {
		panic(error)
	}

	resp, _ := http.Get(*release.asset.BrowserDownloadURL)
	defer resp.Body.Close()

	out, _ := os.Create(*release.asset.Name)
	defer out.Close()

	log.Printf("Downloading latest Flowser release %s", release.version)

	_, err := io.Copy(out, resp.Body)
	if err != nil {
		panic("Install failed")
	}

	return out.Name()
}

type FlowserRelease struct {
	version string
	asset   github.ReleaseAsset
}

func getLatestRelease() (FlowserRelease, error) {
	client := github.NewClient(nil)
	release, _, err := client.Repositories.GetLatestRelease(context.Background(), "onflowser", "flowser")
	if err != nil {
		log.Fatal(err)
	}
	latestVersion := strings.Replace(*release.TagName, "v", "", 1)
	for _, asset := range release.Assets {
		if *asset.Name == getAssetName(latestVersion) {
			return FlowserRelease{
				version: latestVersion,
				asset:   asset,
			}, nil
		}
	}
	return FlowserRelease{}, errors.New("no asset found")
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
	case "windows":
		return fmt.Sprintf("Flowser-%s-win.zip", version)
	default:
		panic("Not implemented")
	}
}

func getInstallDir() string {
	switch runtime.GOOS {
	case "darwin":
		return "/Applications/Flowser.app"
	case "windows":
		// TODO: Search in common install directories
		// https://superuser.com/questions/1327037/what-choices-do-i-have-about-where-to-install-software-on-windows-10
		user, err := user.Current()
		if err != nil {
			log.Fatalf(err.Error())
		}
		return fmt.Sprintf("%s\\AppData\\Local\\Programs\\Flowser", user.HomeDir)
	default:
		panic("Not implemented")
	}
}

func getExecutableFile() string {
	switch runtime.GOOS {
	case "darwin":
		return path.Join(getInstallDir(), "Contents/MacOS/Flowser")
	case "windows":
		return path.Join(getInstallDir(), "Flowser.exe")
	default:
		panic("Not implemented")
	}
}

func Run(location string) {
	cmd := exec.Command(getExecutableFile(), fmt.Sprintf("--project-path=%s", location))
	if err := cmd.Run(); err != nil {
		log.Fatal(err)
	}
}

func main() {
	// TODO: Add proper error handling
	if IsInstalled() {
		log.Println("Flowser is already installed")
	} else {
		Install()
	}
	Run("/path/to/flow/project")
}

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

var errorPlatformNotSupported error = errors.New("platform not supported, only supporting windows and drawin")

func IsInstalled() (bool, error) {
	execFilePath, execFileErr := getExecutableFile()

	if execFileErr != nil {
		return false, execFileErr
	}

	return fileExists(execFilePath)
}

func fileExists(filePath string) (bool, error) {
	if _, err := os.Stat(filePath); err == nil {
		return true, nil
	} else if errors.Is(err, os.ErrNotExist) {
		return false, nil
	} else {
		return false, err
	}
}

func Install() error {
	assetDownloadPath, err := downloadLatestReleaseAsset()

	if err != nil {
		return err
	}

	defer os.Remove(assetDownloadPath)
	switch runtime.GOOS {
	case "darwin":
		// Use native unzip tool as it handles the creation of required symbolic links
		cmd := exec.Command("unzip", assetDownloadPath, "-d", "/Applications")

		if err := cmd.Run(); err != nil {
			return err
		}

		return nil
	case "windows":
		installDir, err := getInstallDir()
		if err != nil {
			return err
		}
		if err := os.Mkdir(installDir, os.ModePerm); err != nil {
			return err
		}

		// tar utility is available from Windows build 17063
		// TODO: consider using other command or a custom implementation
		// https://learn.microsoft.com/en-us/virtualization/community/team-blog/2017/20171219-tar-and-curl-come-to-windows
		cmd := exec.Command("tar", "-xf", assetDownloadPath, "-C", installDir)

		if err := cmd.Run(); err != nil {
			return err
		}

		return nil
	default:
		return errorPlatformNotSupported
	}
}

func downloadLatestReleaseAsset() (string, error) {
	release, error := getLatestRelease()

	if error != nil {
		return "", error
	}

	resp, err := http.Get(*release.asset.BrowserDownloadURL)

	if err != nil {
		return "", err
	}

	defer resp.Body.Close()

	out, _ := os.Create(*release.asset.Name)
	defer out.Close()

	_, err = io.Copy(out, resp.Body)
	if err != nil {
		return "", err
	}

	return out.Name(), nil
}

type FlowserRelease struct {
	version string
	asset   github.ReleaseAsset
}

func getLatestRelease() (FlowserRelease, error) {
	client := github.NewClient(nil)
	release, _, err := client.Repositories.GetLatestRelease(context.Background(), "onflowser", "flowser")
	if err != nil {
		return FlowserRelease{}, err
	}
	latestVersion := strings.Replace(*release.TagName, "v", "", 1)
	targetAssetName, err := getAssetName(latestVersion)
	if err != nil {
		return FlowserRelease{}, err
	}
	for _, asset := range release.Assets {
		if *asset.Name == targetAssetName {
			return FlowserRelease{
				version: latestVersion,
				asset:   asset,
			}, nil
		}
	}
	return FlowserRelease{}, errors.New("no asset found")
}

func getAssetName(version string) (string, error) {
	isArm := strings.HasPrefix(runtime.GOARCH, "arm")
	switch runtime.GOOS {
	case "darwin":
		if isArm {
			return fmt.Sprintf("Flowser-%s-arm64-mac.zip", version), nil
		} else {
			return fmt.Sprintf("Flowser-%s-mac.zip", version), nil
		}
	case "windows":
		return fmt.Sprintf("Flowser-%s-win.zip", version), nil
	default:
		return "", errorPlatformNotSupported
	}
}

func getInstallDir() (string, error) {
	switch runtime.GOOS {
	case "darwin":
		return "/Applications/Flowser.app", nil
	case "windows":
		// TODO: Search in common install directories
		// https://superuser.com/questions/1327037/what-choices-do-i-have-about-where-to-install-software-on-windows-10
		user, err := user.Current()
		if err != nil {
			return "", err
		}
		return fmt.Sprintf("%s\\AppData\\Local\\Programs\\Flowser", user.HomeDir), nil
	default:
		return "", errorPlatformNotSupported
	}
}

func getExecutableFile() (string, error) {
	installDir, err := getInstallDir()
	if err != nil {
		return "", err
	}
	switch runtime.GOOS {
	case "darwin":
		return path.Join(installDir, "Contents/MacOS/Flowser"), nil
	case "windows":
		return path.Join(installDir, "Flowser.exe"), nil
	default:
		return "", errorPlatformNotSupported
	}
}

func Run(location string) error {
	execFilePath, err := getExecutableFile()
	if err != nil {
		return err
	}
	cmd := exec.Command(execFilePath, fmt.Sprintf("--project-path=%s", location))
	if err := cmd.Run(); err != nil {
		return err
	}
	return nil
}

func main() {
	isInstalled, installCheckError := IsInstalled()
	if installCheckError != nil {
		log.Fatalf("Installation check failed: %s", installCheckError)
	}
	if isInstalled {
		log.Println("Flowser is already installed")
	} else {
		log.Println("Installing latest Flowser version")
		installError := Install()
		if installError != nil {
			log.Fatalf("Failed to install: %s", installError)
		}
		log.Println("Flowser installed successfully")
	}
	log.Println("Starting Flowser")
	runError := Run("/path/to/flow/project")
	if runError != nil {
		log.Fatalf("Failed to run: %s", runError)
	}
}

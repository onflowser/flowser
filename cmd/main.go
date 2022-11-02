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
	platform := runtime.GOOS
	execFilePath, err := getExecutableFile(platform)

	if err != nil {
		return false, err
	}

	return fileExists(execFilePath)
}

func Install() error {
	platform := runtime.GOOS
	assetDownloadPath, err := downloadLatestReleaseAsset(platform)

	if err != nil {
		return err
	}

	defer os.Remove(assetDownloadPath)

	var cmd *exec.Cmd
	switch platform {
	case "darwin":
		installDir, err := getInstallDir(platform)
		if err != nil {
			return err
		}
		// Use native unzip tool as it handles the creation of required symbolic links
		cmd = exec.Command("unzip", assetDownloadPath, "-d", installDir)
	case "windows":
		rootDir, err := getAppRootDir(platform)
		if err != nil {
			return err
		}
		if err := os.Mkdir(rootDir, os.ModePerm); err != nil {
			return err
		}

		// tar utility is available from Windows build 17063
		// consider using other command or a custom implementation
		// https://learn.microsoft.com/en-us/virtualization/community/team-blog/2017/20171219-tar-and-curl-come-to-windows
		cmd = exec.Command("tar", "-xf", assetDownloadPath, "-C", rootDir)
	default:
		return errorPlatformNotSupported
	}

	return cmd.Run()
}

func Run(projectPath string) error {
	platform := runtime.GOOS
	execFilePath, err := getExecutableFile(platform)
	if err != nil {
		return err
	}
	cmd := exec.Command(execFilePath, fmt.Sprintf("--project-path=%s", projectPath))

	return cmd.Run()
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

func downloadLatestReleaseAsset(platform string) (string, error) {
	release, err := getLatestRelease(platform)

	if err != nil {
		return "", err
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

func getLatestRelease(platform string) (*FlowserRelease, error) {
	client := github.NewClient(nil)
	release, _, err := client.Repositories.GetLatestRelease(context.Background(), "onflowser", "flowser")
	if err != nil {
		return nil, err
	}
	latestVersion := strings.Replace(*release.TagName, "v", "", 1)
	targetAssetName, err := getAssetName(platform, latestVersion)
	if err != nil {
		return nil, err
	}
	for _, asset := range release.Assets {
		if *asset.Name == targetAssetName {
			return &FlowserRelease{
				version: latestVersion,
				asset:   asset,
			}, nil
		}
	}
	return nil, errors.New("no asset found")
}

func getAssetName(platform string, version string) (string, error) {
	isArm := strings.HasPrefix(runtime.GOARCH, "arm")
	switch platform {
	case "darwin":
		if isArm {
			return fmt.Sprintf("Flowser-%s-arm64-mac.zip", version), nil
		}
		return fmt.Sprintf("Flowser-%s-mac.zip", version), nil
	case "windows":
		return fmt.Sprintf("Flowser-%s-win.zip", version), nil
	default:
		return "", errorPlatformNotSupported
	}
}

func getExecutableFile(platform string) (string, error) {
	files := map[string]string{
		"darwin":  "Contents/MacOS/Flowser",
		"windows": "Flowser.exe",
	}
	file, ok := files[runtime.GOOS]
	if !ok {
		return "", errorPlatformNotSupported
	}
	rootPath, err := getAppRootDir(platform)
	if err != nil {
		return "", nil
	}
	return path.Join(rootPath, file), nil
}

func getAppRootDir(platform string) (string, error) {
	installDir, err := getInstallDir(platform)
	if err != nil {
		return "", err
	}
	return path.Join(installDir, "Flowser"), nil
}

func getInstallDir(platform string) (string, error) {
	switch platform {
	case "darwin":
		return "/Applications", nil
	case "windows":
		// TODO: Search in common install directories
		// https://superuser.com/questions/1327037/what-choices-do-i-have-about-where-to-install-software-on-windows-10
		user, err := user.Current()
		if err != nil {
			return "", err
		}
		return fmt.Sprintf("%s\\AppData\\Local\\Programs", user.HomeDir), nil
	default:
		return "", errorPlatformNotSupported
	}
}

func main() {
	isInstalled, err := IsInstalled()
	if err != nil {
		log.Fatalf("Installation check failed: %s", err)
	}
	if isInstalled {
		log.Println("Flowser is already installed")
	} else {
		log.Println("Installing latest Flowser version")
		err := Install()
		if err != nil {
			log.Fatalf("Failed to install: %s", err)
		}
		log.Println("Flowser installed successfully")
	}
	log.Println("Starting Flowser")
	err = Run("/path/to/flow/project")
	if err != nil {
		log.Fatalf("Failed to run: %s", err)
	}
}

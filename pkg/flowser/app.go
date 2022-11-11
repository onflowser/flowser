package flowser

import (
	"context"
	"errors"
	"fmt"
	"io"
	"net/http"
	"os"
	"os/exec"
	"os/user"
	"path"
	"runtime"
	"strings"

	"github.com/google/go-github/github"
)

const (
	darwin  = "darwin"
	windows = "windows"
)

type App struct {
	installDir string
}

var errorPlatformNotSupported = errors.New("OS not supported, only supporting Windows and Mac OS")

// Run starts the Flowser application with provided path to the flow project.
//
// Project path if exists should be set to the folder containing flow.json, if no such path exists pass empty value.
func (a *App) Run(projectPath string) error {
	exe, err := a.executable()
	if err != nil {
		return err
	}

	if projectPath != "" {
		projectPath = fmt.Sprintf("--project-path=%s", projectPath)
	}

	return exec.
		Command(exe, projectPath).
		Run()
}

// Install Flowser application in the provided install directory.
//
// Install directory is optional, if you want to default to your system location you can provide empty value.
func (a *App) Install(installDir string) (string, error) {
	a.installDir = installDir

	downloadDir, err := downloadLatestReleaseAsset()
	if err != nil {
		return "", err
	}

	defer os.Remove(downloadDir)

	dir, err := a.getInstallDir()
	if err != nil {
		return "", err
	}

	return a.unzip(downloadDir, dir)
}

// Installed checks whether the flowser application is already installed on the system.
func (a *App) Installed() (bool, error) {
	executable, err := a.executable()
	if err != nil {
		return false, err
	}

	_, err = os.Stat(executable)
	return err == nil, err
}

// Remove Flowser application from provide directory.
//
// Install directory is optional, if you don't provide a value default will be used.
func (a *App) Remove(installDir string) error {
	a.installDir = installDir

	dir, err := a.getAppDir()
	if err != nil {
		return err
	}

	return os.RemoveAll(dir)
}

// unzip content from source compressed file to a target directory.
func (a *App) unzip(source string, target string) (string, error) {
	var cmd *exec.Cmd
	switch runtime.GOOS {
	case darwin:
		// Use native unzip tool as it handles the creation of required symbolic links
		cmd = exec.Command("unzip", source, "-d", target)
	case windows:
		rootDir, err := a.getAppDir()
		if err != nil {
			return "", err
		}

		if err := os.MkdirAll(rootDir, os.ModePerm); err != nil {
			return target, err
		}

		// tar utility is available from Windows build 17063 consider using other command or a custom implementation
		// https://learn.microsoft.com/en-us/virtualization/community/team-blog/2017/20171219-tar-and-curl-come-to-windows
		cmd = exec.Command("tar", "-xf", source, "-C", rootDir)
	default:
		return "", errorPlatformNotSupported
	}

	return target, cmd.Run()
}

// getInstallDir returns the location where we install the flowser.
func (a *App) getInstallDir() (string, error) {
	if a.installDir != "" {
		return a.installDir, nil
	}

	switch runtime.GOOS {
	case darwin:
		return "/Applications", nil
	case windows:
		// TODO: Search in common install directories
		// https://superuser.com/questions/1327037/what-choices-do-i-have-about-where-to-install-software-on-windows-10
		user, err := user.Current()
		if err != nil {
			return "", fmt.Errorf("could not find user information", err)
		}
		return path.Join(user.HomeDir, "AppData", "Local"), nil
	default:
		return "", errorPlatformNotSupported
	}
}

// getAppDir returns the location of the executable application inside the installation dir.
func (a *App) getAppDir() (string, error) {
	dir, err := a.getInstallDir()
	if err != nil {
		return "", err
	}

	return path.Join(dir, "Flowser.app"), nil
}

// executable returns the location of application executable.
func (a *App) executable() (string, error) {
	files := map[string]string{
		darwin:  "Contents/MacOS/Flowser",
		windows: "Flowser.exe",
	}
	file, ok := files[runtime.GOOS]
	if !ok {
		return "", errorPlatformNotSupported
	}

	appDir, err := a.getAppDir()
	if err != nil {
		return "", err
	}

	return path.Join(appDir, file), nil
}

func downloadLatestReleaseAsset() (string, error) {
	release, err := getLatestRelease()

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

type flowserRelease struct {
	version string
	asset   github.ReleaseAsset
}

func getLatestRelease() (*flowserRelease, error) {
	client := github.NewClient(nil)
	release, _, err := client.Repositories.GetLatestRelease(context.Background(), "onflowser", "flowser")
	if err != nil {
		return nil, err
	}
	latestVersion := strings.Replace(*release.TagName, "v", "", 1)
	targetAssetName, err := getAssetName(latestVersion)
	if err != nil {
		return nil, err
	}
	for _, asset := range release.Assets {
		if *asset.Name == targetAssetName {
			return &flowserRelease{
				version: latestVersion,
				asset:   asset,
			}, nil
		}
	}
	return nil, errors.New("no asset found")
}

func getAssetName(version string) (string, error) {
	isArm := strings.HasPrefix(runtime.GOARCH, "arm")
	switch runtime.GOOS {
	case darwin:
		if isArm {
			return fmt.Sprintf("Flowser-%s-arm64-mac.zip", version), nil
		}
		return fmt.Sprintf("Flowser-%s-mac.zip", version), nil
	case windows:
		return fmt.Sprintf("Flowser-%s-win.zip", version), nil
	default:
		return "", errorPlatformNotSupported
	}
}

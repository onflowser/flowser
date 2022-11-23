package flowser

import (
	"context"
	"errors"
	"fmt"
	"io"
	"net/http"
	"os"
	"os/exec"
	"os/signal"
	"path"
	"runtime"
	"strings"
	"syscall"

	"github.com/google/go-github/github"
)

const (
	darwin  = "darwin"
	windows = "windows"
)

// New create new Flowser application.
func New() *App {
	return &App{}
}

type App struct{}

var errorPlatformNotSupported = errors.New("OS not supported, only supporting Windows and Mac OS")

// Run starts the Flowser application with provided path to the flow project.
//
// Project path if exists should be set to the folder containing flow.json, if no such path exists pass empty value.
func (a *App) Run(installDir string, projectPath string) error {
	exe, err := a.executable(installDir)
	if err != nil {
		return err
	}

	if projectPath != "" {
		projectPath = fmt.Sprintf("--project-path=%s", projectPath)
	}

	cmd := exec.Command(exe, projectPath)

	go func() {
		sig := make(chan os.Signal, 1)
		signal.Notify(sig, os.Interrupt)
		signal.Notify(sig, syscall.SIGTERM, syscall.SIGINT)
		<-sig
		_ = cmd.Process.Kill()
	}()

	return cmd.Run()
}

// Install Flowser application in the provided install directory.
func (a *App) Install(installDir string) error {
	downloadDir, err := downloadLatestReleaseAsset()
	if err != nil {
		return err
	}

	defer os.Remove(downloadDir)
	return a.unzip(downloadDir, installDir)
}

// Installed checks whether the flowser application is already installed on the system.
func (a *App) Installed(installDir string) bool {
	executable, err := a.executable(installDir)
	if err != nil {
		return false
	}

	_, err = os.Stat(executable)
	return err == nil
}

// Remove Flowser application from provide directory.
//
// Install directory is optional, if you don't provide a value default will be used.
func (a *App) Remove(installDir string) error {
	dir, err := a.appDir(installDir)
	if err != nil {
		return err
	}

	return os.RemoveAll(dir)
}

// unzip content from source compressed file to a target directory.
func (a *App) unzip(source string, target string) error {
	var cmd *exec.Cmd
	switch runtime.GOOS {
	case darwin:
		// Use native unzip tool as it handles the creation of required symbolic links
		cmd = exec.Command("unzip", source, "-d", target)
	case windows:
		appDir, err := a.appDir(target)
		if err != nil {
			return err
		}

		if err := os.MkdirAll(appDir, os.ModePerm); err != nil {
			return err
		}

		// tar utility is available from Windows build 17063 consider using other command or a custom implementation
		// https://learn.microsoft.com/en-us/virtualization/community/team-blog/2017/20171219-tar-and-curl-come-to-windows
		cmd = exec.Command("tar", "-xf", source, "-C", appDir)
	default:
		return errorPlatformNotSupported
	}

	return cmd.Run()
}

// appDir returns the location of the executable application inside the installation dir.
func (a *App) appDir(installDir string) (string, error) {
	return path.Join(installDir, "Flowser.app"), nil
}

// executable returns the location of application executable.
func (a *App) executable(installDir string) (string, error) {
	files := map[string]string{
		darwin:  "Contents/MacOS/Flowser",
		windows: "@flowserapp",
	}
	file, ok := files[runtime.GOOS]
	if !ok {
		return "", errorPlatformNotSupported
	}

	appDir, err := a.appDir(installDir)
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

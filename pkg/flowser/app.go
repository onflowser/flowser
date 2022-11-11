package app

import (
	"context"
	"errors"
	"fmt"
	"github.com/google/go-github/github"
	"io"
	"net/http"
	"os"
	"os/exec"
	"os/user"
	"path"
	"runtime"
	"strings"
)

const (
	darwin  = "darwin"
	windows = "windows"
)

type App struct {
	installDir string
}

var errorPlatformNotSupported = errors.New("platform not supported, only supporting windows and drawin")

func (a *App) IsInstalled() (bool, error) {
	installDir, err := getInstallDir(a.installDir)
	if err != nil {
		return false, err
	}
	execFilePath, err := getExecutableFile(installDir)

	if err != nil {
		return false, err
	}

	return fileExists(execFilePath)
}

func (a *App) Install() (string, error) {
	assetDownloadPath, err := downloadLatestReleaseAsset()

	defer os.Remove(assetDownloadPath)

	if err != nil {
		return "", err
	}

	installDir, err := getInstallDir(a.installDir)
	if err != nil {
		return "", err
	}

	var cmd *exec.Cmd
	switch runtime.GOOS {
	case darwin:
		// Use native unzip tool as it handles the creation of required symbolic links
		cmd = exec.Command("unzip", assetDownloadPath, "-d", installDir)
	case windows:
		rootDir := getAppRootDir(installDir)
		if err := os.MkdirAll(rootDir, os.ModePerm); err != nil {
			return installDir, err
		}

		// tar utility is available from Windows build 17063
		// consider using other command or a custom implementation
		// https://learn.microsoft.com/en-us/virtualization/community/team-blog/2017/20171219-tar-and-curl-come-to-windows

		// Note: This command will probably fail with below error if run with bash or wsl on Windows
		// tar: Archive contains ‘\n\372\266\353v\363\236\331o\362\300\365’ where numeric off_t value expected
		cmd = exec.Command("tar", "-xf", assetDownloadPath, "-C", rootDir)
	default:
		return installDir, errorPlatformNotSupported
	}

	return installDir, cmd.Run()
}

func (a *App) Run(flowProjectPath string) error {
	installDir, err := getInstallDir(a.installDir)
	if err != nil {
		return err
	}
	execFilePath, err := getExecutableFile(installDir)
	if err != nil {
		return err
	}
	cmd := exec.Command(execFilePath, fmt.Sprintf("--project-path=%s", flowProjectPath))

	return cmd.Run()
}

func (a *App) Remove() error {
	appRootDir := getAppRootDir(a.installDir)
	return os.RemoveAll(appRootDir)
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

func getExecutableFile(installDir string) (string, error) {
	files := map[string]string{
		darwin:  "Contents/MacOS/Flowser",
		windows: "Flowser.exe",
	}
	file, ok := files[runtime.GOOS]
	if !ok {
		return "", errorPlatformNotSupported
	}
	rootPath := getAppRootDir(installDir)
	return path.Join(rootPath, file), nil
}

func getAppRootDir(installDir string) string {
	return path.Join(installDir, "Flowser.app")
}

func getInstallDir(customInstallDir string) (string, error) {
	if customInstallDir != "" {
		return customInstallDir, nil
	}

	switch runtime.GOOS {
	case darwin:
		return "/Applications", nil
	case windows:
		// TODO: Search in common install directories
		// https://superuser.com/questions/1327037/what-choices-do-i-have-about-where-to-install-software-on-windows-10
		user, err := user.Current()
		if err != nil {
			return "", err
		}
		return path.Join(user.HomeDir, "AppData", "Local"), nil
	default:
		return "", errorPlatformNotSupported
	}
}

package main

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

type FlowserApp struct {
	installDir string
	platform   string
}

var errorPlatformNotSupported error = errors.New("platform not supported, only supporting windows and drawin")

func (app FlowserApp) IsInstalled() (bool, error) {
	platform := app.platform
	if platform == "" {
		platform = runtime.GOOS
	}
	execFilePath, err := getExecutableFile(app.installDir, platform)

	if err != nil {
		return false, err
	}

	return fileExists(execFilePath)
}

func (app FlowserApp) Install() (string, error) {
	platform := app.platform
	if platform == "" {
		platform = runtime.GOOS
	}
	assetDownloadPath, err := downloadLatestReleaseAsset(platform)

	if err != nil {
		return "", err
	}

	defer os.Remove(assetDownloadPath)

	installDir, err := getInstallDir(app.installDir, platform)
	if err != nil {
		return "", err
	}

	var cmd *exec.Cmd
	switch platform {
	case "darwin":
		// Use native unzip tool as it handles the creation of required symbolic links
		cmd = exec.Command("unzip", assetDownloadPath, "-d", installDir)
	case "windows":
		rootDir := getAppRootDir(installDir, platform)
		if err := os.Mkdir(rootDir, os.ModePerm); err != nil {
			return installDir, err
		}

		// tar utility is available from Windows build 17063
		// consider using other command or a custom implementation
		// https://learn.microsoft.com/en-us/virtualization/community/team-blog/2017/20171219-tar-and-curl-come-to-windows
		cmd = exec.Command("tar", "-xf", assetDownloadPath, "-C", rootDir)
	default:
		return installDir, errorPlatformNotSupported
	}

	return installDir, cmd.Run()
}

func (app FlowserApp) Run(flowProjectPath string) error {
	platform := app.platform
	if platform == "" {
		platform = runtime.GOOS
	}
	installDir, err := getInstallDir(app.installDir, platform)
	if err != nil {
		return err
	}
	execFilePath, err := getExecutableFile(installDir, platform)
	if err != nil {
		return err
	}
	cmd := exec.Command(execFilePath, fmt.Sprintf("--project-path=%s", flowProjectPath))

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

type flowserRelease struct {
	version string
	asset   github.ReleaseAsset
}

func getLatestRelease(platform string) (*flowserRelease, error) {
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
			return &flowserRelease{
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

func getExecutableFile(installDir string, platform string) (string, error) {
	files := map[string]string{
		"darwin":  "Contents/MacOS/Flowser",
		"windows": "Flowser.exe",
	}
	file, ok := files[runtime.GOOS]
	if !ok {
		return "", errorPlatformNotSupported
	}
	rootPath := getAppRootDir(installDir, platform)
	return path.Join(rootPath, file), nil
}

func getAppRootDir(installDir string, platform string) string {
	return path.Join(installDir, "Flowser.app")
}

func getInstallDir(customInstallDir string, platform string) (string, error) {
	if customInstallDir != "" {
		return customInstallDir, nil
	}

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

import React, { useState } from "react";
import ReactDOM from "react-dom";
import "apps/electron/src/renderer/App.scss";
import { FlowserClientApp } from "apps/electron/src/renderer/router";
import reportWebVitals from "reportWebVitals";
// Note that imports paths must be relative to project root
// because this file is copied to src/index.tsx before build
import { ExitLoader } from "../../../../apps/electron/src/renderer/components/loaders/ExitLoader";
import { UpdateLoader } from "../../../../apps/electron/src/renderer/components/loaders/UpdateLoader";
import { SentryRendererService } from "../../../../apps/electron/src/services/sentry-renderer.service";

declare global {
  interface Window {
    platformAdapter: {
      showDirectoryPicker: () => Promise<string | undefined>;
      handleExit: (callback: () => void) => void;
      handleUpdateDownloadStart: (callback: () => void) => void;
      handleUpdateDownloadEnd: (callback: () => void) => void;
      handleUpdateDownloadProgress: (
        callback: (percentage: number) => void
      ) => void;
    };
  }
}

const sentryService = new SentryRendererService();
sentryService.init();

function Root() {
  const [isExiting, setIsExiting] = useState(false);
  const [appUpdateDownloadPercentage, setAppUpdateDownloadPercentage] =
    useState(0);
  const isUpdating = ![0, 100].includes(appUpdateDownloadPercentage);

  window.platformAdapter.handleExit(() => {
    setIsExiting(true);
  });

  window.platformAdapter.handleUpdateDownloadProgress((percentage) => {
    setAppUpdateDownloadPercentage(percentage);
  });

  window.platformAdapter.handleUpdateDownloadStart(() => {
    setAppUpdateDownloadPercentage(0);
  });
  window.platformAdapter.handleUpdateDownloadEnd(() => {
    setAppUpdateDownloadPercentage(100);
  });

  return (
    <>
      {isExiting && <ExitLoader />}
      {isUpdating && (
        <UpdateLoader loadingPercentage={appUpdateDownloadPercentage} />
      )}
      <FlowserClientApp
        // https://github.com/remix-run/react-router/issues/8331
        useHashRouter
        platformAdapter={{
          monitoringService: sentryService,
          onPickProjectPath: window.platformAdapter.showDirectoryPicker,
        }}
      />
    </>
  );
}

ReactDOM.render(
  <React.StrictMode>
    <Root />
  </React.StrictMode>,
  document.getElementById("root")
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();

import React from "react";
import ReactDOM from "react-dom";
import "App.scss";
import { FlowserClientApp } from "App";
import reportWebVitals from "reportWebVitals";
import { QueryClientProvider, QueryClient } from "react-query";
import splitbee from "@splitbee/web";

// init analytics
if (process.env.NODE_ENV !== "development") {
  splitbee.init({
    token: "B3B9T4Z4SRQ3",
    disableCookie: true,
  });
}

const queryClient = new QueryClient();

// Define preload.ts functions
declare global {
  interface Window {
    platformAdapter: {
      showDirectoryPicker: () => Promise<string | undefined>;
    };
  }
}

ReactDOM.render(
  <React.StrictMode>
    <QueryClientProvider client={queryClient}>
      <FlowserClientApp
        platformAdapter={{
          onPickProjectPath: window.platformAdapter.showDirectoryPicker,
        }}
      />
    </QueryClientProvider>
  </React.StrictMode>,
  document.getElementById("root")
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();

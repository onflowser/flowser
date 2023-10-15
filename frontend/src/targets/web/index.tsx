import React from "react";
import ReactDOM from "react-dom";
import "apps/electron/src/renderer/App.scss";
import { FlowserClientApp } from "apps/electron/src/renderer/router";
import reportWebVitals from "reportWebVitals";

async function renderApp() {
  ReactDOM.render(
    <React.StrictMode>
      <FlowserClientApp platformAdapter={{}} />
    </React.StrictMode>,
    document.getElementById("root")
  );
}

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();

renderApp();

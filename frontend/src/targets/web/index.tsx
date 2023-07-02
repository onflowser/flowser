import React from "react";
import ReactDOM from "react-dom";
import "App.scss";
import { FlowserClientApp } from "App";
import reportWebVitals from "reportWebVitals";
import { CadenceParser } from "@onflow/cadence-parser";

async function renderApp() {
  // For now just make sure to put the cadence-parser.wasm
  // from @onflow/cadence-parser build folder to /public folder manually.
  const cadenceParser = await CadenceParser.create("/cadence-parser.wasm");

  ReactDOM.render(
    <React.StrictMode>
      <FlowserClientApp platformAdapter={{ cadenceParser }} />
    </React.StrictMode>,
    document.getElementById("root")
  );
}

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();

renderApp();

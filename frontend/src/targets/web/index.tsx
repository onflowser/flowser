import React from "react";
import ReactDOM from "react-dom";
import "App.scss";
import { FlowserClientApp } from "App";
import reportWebVitals from "reportWebVitals";

async function renderApp() {
  ReactDOM.render(
    <React.StrictMode>
      <FlowserClientApp platformAdapter={{}} />
    </React.StrictMode>,
    document.getElementById("root")
  );
}

// If you want to projects measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();

renderApp();

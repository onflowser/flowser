import React from "react";
import { render, screen } from "@testing-library/react";
import { FlowserClientApp } from "./App";

test("renders learn react link", () => {
  render(<FlowserClientApp />);
  const linkElement = screen.getByText(/Hello Flowser/i);
  expect(linkElement).toBeInTheDocument();
});

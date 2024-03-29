import React, { FC } from "react";
import CodeMirror from "@uiw/react-codemirror";
import { StreamLanguage } from "@codemirror/language";
import { githubDark } from "@uiw/codemirror-theme-github";
import { swift } from "@codemirror/legacy-modes/mode/swift";
import { basicSetup } from "@uiw/codemirror-extensions-basic-setup";
import "./cadence-editor.css";
import { ReactCodeMirrorProps } from "@uiw/react-codemirror/src";
import classNames from "classnames";

export type CadenceEditorProps = ReactCodeMirrorProps;

export const CadenceEditor: FC<CadenceEditorProps> = (props) => {
  return (
    <CodeMirror
      {...props}
      className={classNames("cadence-editor", props.className)}
      theme={githubDark}
      extensions={[
        StreamLanguage.define(swift),
        basicSetup({ foldGutter: false }),
      ]}
    />
  );
};

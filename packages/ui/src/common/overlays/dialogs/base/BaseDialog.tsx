import React, {
  FunctionComponent,
  MouseEventHandler,
  ReactNode
} from "react";
import classes from "./BaseDialog.module.scss";
import { FlowserIcon } from "../../../icons/FlowserIcon";
import ReactModal from 'react-modal';

export type DialogProps = {
  children: ReactNode;
  onClose: MouseEventHandler<HTMLDivElement>;
  zIndex?: string;
};

export const BaseDialog: FunctionComponent<DialogProps> = ({
  onClose,
  zIndex = 10,
  children,
}) => {

  return (
    <ReactModal
      isOpen={true}
      onRequestClose={onClose}
      shouldCloseOnEsc={true}
      shouldCloseOnOverlayClick={true}
      // For some reason, the component has weird behaviour when defining styles using class names.
      // So for now just specify styles as objects and hardcode style constants.
      style={{
        overlay: {
          backgroundColor: "transparentize(#1c2128, 0.5)",
          backdropFilter: "blur(2px)",
          zIndex,
        },
        content: {
          zIndex: 100,
          color: "white",
          overflow: "scroll",
          backgroundColor: "#1c2128", // gray-110
          border: "1px solid #565a5f", // gray-50
          top: "50%",
          left: "50%",
          right: "auto",
          bottom: "auto",
          marginRight: "-50%",
          transform: "translate(-50%, -50%)",
          padding: 20,
          maxWidth: "80%",
          maxHeight: "80%",
          borderRadius: 10,
        }
      }}
    >
      <FlowserIcon.Close
        className={classes.closeButton}
        width={20}
        height={20}
        onClick={onClose}
      />
      {children}
    </ReactModal>
  );
};

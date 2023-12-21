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
  className?: string;
  zIndex?: string;
};

export const BaseDialog: FunctionComponent<DialogProps> = ({
  onClose,
  zIndex = 10,
  children,
  className
}) => {

  return (
    <ReactModal
      className={classes.content}
      overlayClassName={classes.overlay}
      isOpen={true}
      onRequestClose={onClose}
      shouldCloseOnEsc={true}
      shouldCloseOnOverlayClick={true}
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

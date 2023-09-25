import React, { ReactElement, useState } from "react";
import { BaseDialog } from "../base/BaseDialog";
import classes from "./ConsentDialog.module.scss";
import logo from "../../../../assets/images/logo-foreground.svg";
import ToggleButton, {
  ToggleButtonProps,
} from "../../../buttons/ToggleButton/ToggleButton";
import Button from "../../../buttons/Button/Button";

export type ConsentDialogProps = {
  consent: boolean;
  setConsent: (value: boolean) => void;
  onClose?: () => void;
};

export function ConsentDialog({
  consent,
  setConsent,
  onClose = () => null,
}: ConsentDialogProps): ReactElement | null {
  const [tempConsent, setTempConsent] = useState<boolean>(consent);

  return (
    <BaseDialog onClose={onClose} className={classes.modal}>
      <div className={classes.root}>
        <div className={classes.header}>
          <img alt="Flowser logo" src={logo} className={classes.logo} />
          <h2>We would appreciate your help!</h2>
        </div>
        <div className={classes.body}>
          <div className={classes.leftSide}>
            <p>
              We are constantly trying to improve the user experience. Your
              feedback and permission to use analytics for a better
              understanding of the application usage would help us a lot.
            </p>
            <p>
              You can change this setting any time on the start (About) screen.
            </p>
            <p>Thank you for your help!</p>
          </div>
          <div className={classes.rightSide}>
            <b>What do we track?</b>
            <ul>
              <li>Screen views</li>
              <li>App features usage</li>
              <li>We do not collect any sensitive data</li>
            </ul>
          </div>
        </div>
        <div className={classes.footer}>
          <ToggleAnalytics value={tempConsent} onChange={setTempConsent} />
          <Button onClick={() => setConsent(tempConsent)}>Continue</Button>
        </div>
      </div>
    </BaseDialog>
  );
}

function ToggleAnalytics(props: ToggleButtonProps) {
  return (
    <div className={classes.toggleAnalytics}>
      <ToggleButton className={classes.toggleButton} {...props} />
      Analytics are {props.value ? `enabled` : `disabled`}
    </div>
  );
}

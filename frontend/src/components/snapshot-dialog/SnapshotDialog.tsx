import React, { FC, useState } from "react";
import Dialog from "../dialog/Dialog";
import Button from "../button/Button";
import classes from "./SnapshotDialog.module.scss";
import toast from "react-hot-toast";
import { ServiceRegistry } from "../../services/service-registry";
import Input from "../input/Input";

export type SnapshotDialogProps = {
  show?: boolean;
  setShow: (value: boolean) => void;
};

export const SnapshotDialog: FC<SnapshotDialogProps> = ({ show, setShow }) => {
  const { snapshotService } = ServiceRegistry.getInstance();
  const [loading, setLoading] = useState(false);
  const [description, setDescription] = useState("");

  function onClose() {
    setShow(false);
  }

  async function onConfirm() {
    setLoading(true);
    try {
      await snapshotService.create({
        description,
      });
      toast.success("Snapshot created");
    } catch (e) {
      console.error(e);
      toast.error("Failed to create snapshot");
    } finally {
      setLoading(false);
    }
  }

  if (!show) {
    return null;
  }

  return (
    <Dialog className={classes.dialog} onClose={onClose}>
      <div className={classes.root}>
        <h3>CREATE EMULATOR SNAPSHOT</h3>
        <div className={classes.body}>
          <p>
            This action will create a snapshot of the whole blockchain state at
            the latest block.
          </p>
          <Input
            placeholder="Snapshot description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />
        </div>
        <div className={classes.actions}>
          <Button outlined={true} variant="middle" onClick={onClose}>
            Cancel
          </Button>
          <Button loading={loading} variant="middle" onClick={onConfirm}>
            Send
          </Button>
        </div>
      </div>
    </Dialog>
  );
};

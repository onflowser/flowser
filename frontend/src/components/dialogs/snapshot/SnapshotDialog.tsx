import React, { FC, useState } from "react";
import Button from "../../buttons/button/Button";
import classes from "./SnapshotDialog.module.scss";
import toast from "react-hot-toast";
import { ServiceRegistry } from "../../../services/service-registry";
import Input from "../../inputs/input/Input";
import { ActionDialog } from "../action/ActionDialog";
import { useErrorHandler } from "../../../hooks/use-error-handler";
import { useCurrentProjectId } from "../../../hooks/use-current-project-id";

export type SnapshotDialogProps = {
  show?: boolean;
  setShow: (value: boolean) => void;
};

export const SnapshotDialog: FC<SnapshotDialogProps> = ({ show, setShow }) => {
  const projectId = useCurrentProjectId();
  const { handleError } = useErrorHandler(SnapshotDialog.name);
  const { snapshotService } = ServiceRegistry.getInstance();
  const [loading, setLoading] = useState(false);
  const [description, setDescription] = useState("");

  function onClose() {
    setShow(false);
  }

  async function onConfirm() {
    if (!projectId) {
      return;
    }
    setLoading(true);
    try {
      await snapshotService.create({
        description,
        projectId,
      });
      toast.success("Snapshot created");
      onClose();
    } catch (e) {
      handleError(e);
      toast(
        "Make sure you are using the '--snapshot' flag when running emulator",
        { duration: 4000 }
      );
    } finally {
      setLoading(false);
    }
  }

  if (!show) {
    return null;
  }

  return (
    <ActionDialog
      className={classes.root}
      title="Create emulator snapshot"
      onClose={onClose}
      footer={
        <>
          <Button outlined={true} variant="middle" onClick={onClose}>
            Cancel
          </Button>
          <Button loading={loading} variant="middle" onClick={onConfirm}>
            Create
          </Button>
        </>
      }
    >
      <p className={classes.description}>
        This action will create a snapshot of the whole blockchain state at the
        latest block.
      </p>
      <Input
        placeholder="Snapshot description"
        value={description}
        onChange={(e) => setDescription(e.target.value)}
      />
    </ActionDialog>
  );
};

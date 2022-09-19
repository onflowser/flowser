import React, { ReactElement, useCallback, useState } from "react";
import { createContext, useContext } from "react";
import { routes } from "../constants/routes";
import { useHistory } from "react-router-dom";
import { useFlow } from "../hooks/use-flow";
import toast from "react-hot-toast";
import { Project } from "@flowser/shared";
import { useConfirmDialog } from "./confirm-dialog.context";
import { ServiceRegistry } from "../services/service-registry";
import { useGetCurrentProject, useGetPollingBlocks } from "../hooks/use-api";
import { SnapshotDialog } from "../components/snapshot-dialog/SnapshotDialog";
import TransactionDialog from "../components/transaction-dialog/TransactionDialog";
import { useErrorHandler } from "../hooks/use-error-handler";

export type ProjectActionsContextState = {
  isSwitching: boolean;
  switchProject: () => Promise<void>;

  sendTransaction: () => void;
  createSnapshot: () => void;
  revertToBlock: (blockId: string) => void;

  isRemovingProject: boolean;
  removeProject: (project: Project) => void;
};

const ProjectActionsContext = createContext<ProjectActionsContextState>(
  {} as ProjectActionsContextState
);

export function useProjectActions(): ProjectActionsContextState {
  return useContext(ProjectActionsContext);
}

export function ProjectActionsProvider({
  children,
}: {
  children: ReactElement;
}): ReactElement {
  const { projectsService, snapshotService } = ServiceRegistry.getInstance();

  const history = useHistory();
  const { handleError } = useErrorHandler(ProjectActionsProvider.name);
  const { showDialog, hideDialog } = useConfirmDialog();
  const { data: currentProject } = useGetCurrentProject();
  const { isLoggedIn, logout } = useFlow();
  const { data: blocks, fetchAll } = useGetPollingBlocks();

  const [showTxDialog, setShowTxDialog] = useState(false);
  const [showSnapshotModal, setShowSnapshotModal] = useState(false);
  const [isSwitching, setIsSwitching] = useState(false);
  const [isRemovingProject, setIsRemovingProject] = useState(false);

  const confirmProjectRemove = async (project: Project) => {
    setIsRemovingProject(true);
    try {
      await projectsService.removeProject(project.id);
      toast(`Project "${project.name}" deleted!`);
      history.replace(`/${routes.start}`);
    } catch (e) {
      toast.error("Something went wrong: can not delete custom emulator");
    } finally {
      hideDialog();
      setIsRemovingProject(false);
    }
  };

  function removeProject(project: Project) {
    showDialog({
      title: "Delete project",
      body: <span>Are you sure you want to delete this project?</span>,
      onConfirm: () => confirmProjectRemove(project),
      confirmBtnLabel: "DELETE",
      cancelBtnLabel: "BACK",
    });
  }

  const switchProject = useCallback(async () => {
    setIsSwitching(true);
    try {
      await projectsService.unUseCurrentProject();
    } catch (e) {
      // nothing critical happened, ignore the error
      console.warn("Couldn't stop the emulator: ", e);
    }
    history.replace(`/${routes.start}`);
    try {
      await logout(); // logout from dev-wallet, because config may change
    } finally {
      setIsSwitching(false);
    }
  }, []);

  const createSnapshot = useCallback(() => {
    const { snapshot } = currentProject?.project?.emulator ?? {};
    if (!snapshot) {
      toast(
        "Snapshots can only be created when enabling the 'snapshot' option",
        {
          duration: 5000,
        }
      );
    } else {
      setShowSnapshotModal(true);
    }
  }, [currentProject]);

  const sendTransaction = useCallback(() => {
    if (!isLoggedIn) {
      toast("You need to login with wallet to send transactions", {
        duration: 5000,
      });
    } else {
      setShowTxDialog(true);
    }
  }, [isLoggedIn]);

  const revertToBlock = useCallback(async (blockId: string) => {
    const isSnapshotEnabled = currentProject?.project?.emulator?.snapshot;
    if (!isSnapshotEnabled) {
      toast.error(
        "Can't revert, because 'snapshot' option is not enabled in settings"
      );
      return;
    }
    const block = blocks.find((block) => block.id === blockId);
    showDialog({
      title: "Revert to snapshot",
      body: (
        <span style={{ textAlign: "center" }}>
          Do you want to revert the emulator blockchain state to the block with
          height <code>{block?.height}</code>?
        </span>
      ),
      confirmBtnLabel: "REVERT",
      cancelBtnLabel: "CANCEL",
      onConfirm: async () => {
        try {
          const snapshot = await snapshotService.revertTo({
            blockId,
          });
          fetchAll();
          toast.success(`Reverted to "${snapshot.snapshot?.description}"`);
        } catch (e) {
          handleError(e);
        }
      },
    });
  }, []);

  return (
    <ProjectActionsContext.Provider
      value={{
        isSwitching,
        switchProject,
        createSnapshot,
        sendTransaction,
        isRemovingProject,
        revertToBlock,
        removeProject,
      }}
    >
      <TransactionDialog show={showTxDialog} setShow={setShowTxDialog} />
      <SnapshotDialog show={showSnapshotModal} setShow={setShowSnapshotModal} />
      {children}
    </ProjectActionsContext.Provider>
  );
}

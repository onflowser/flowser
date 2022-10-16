import React, {
  createContext,
  ReactElement,
  useContext,
  useState,
} from "react";
import { routes } from "../constants/routes";
import { useHistory } from "react-router-dom";
import { useFlow } from "../hooks/use-flow";
import toast from "react-hot-toast";
import { Project } from "@flowser/shared";
import { useConfirmDialog } from "./confirm-dialog.context";
import { ServiceRegistry } from "../services/service-registry";
import {
  useCurrentProjectId,
  useGetCurrentProject,
  useGetPollingBlocks,
} from "../hooks/use-api";
import { SnapshotDialog } from "../components/snapshot-dialog/SnapshotDialog";
import TransactionDialog from "../components/transaction-dialog/TransactionDialog";
import { useErrorHandler } from "../hooks/use-error-handler";
import { useQueryClient } from "react-query";
import { useAnalytics } from "../hooks/use-analytics";
import { AnalyticEvent } from "../services/analytics.service";

export type ProjectActionsContextState = {
  isSwitching: boolean;
  switchProject: () => Promise<void>;

  sendTransaction: () => void;
  createSnapshot: () => void;
  checkoutBlock: (blockId: string) => void;

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

  const { track } = useAnalytics();
  const queryClient = useQueryClient();
  const history = useHistory();
  const { handleError } = useErrorHandler(ProjectActionsProvider.name);
  const { showDialog, hideDialog } = useConfirmDialog();
  const projectId = useCurrentProjectId();
  const { data: currentProject } = useGetCurrentProject();
  const { isLoggedIn, logout } = useFlow();
  const { data: blocks, fetchAll } = useGetPollingBlocks();

  const [showTxDialog, setShowTxDialog] = useState(false);
  const [showSnapshotModal, setShowSnapshotModal] = useState(false);
  const [isSwitching, setIsSwitching] = useState(false);
  const [isRemovingProject, setIsRemovingProject] = useState(false);

  const confirmProjectRemove = async (project: Project) => {
    track(AnalyticEvent.PROJECT_REMOVED, { projectName: project.name });

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

  async function switchProject() {
    setIsSwitching(true);
    const execute = async () => {
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
      // Clear the entire cache,
      // so that previous data isn't there when using another project
      queryClient.clear();
    };
    toast.promise(execute(), {
      loading: "Closing project...",
      success: "Project closed!",
      error: "Something went wrong, try again!",
    });
  }

  function createSnapshot() {
    track(AnalyticEvent.CREATE_SNAPSHOT);

    const { snapshot } = currentProject?.project?.emulator ?? {};
    if (!snapshot) {
      toast(
        "Snapshots can only be created when enabling the 'snapshot' option in settings",
        {
          duration: 5000,
        }
      );
    } else {
      setShowSnapshotModal(true);
    }
  }

  function sendTransaction() {
    track(AnalyticEvent.CLICK_SEND_TRANSACTION);

    if (!isLoggedIn) {
      toast("You need to login with wallet to send transactions", {
        duration: 5000,
      });
    } else {
      setShowTxDialog(true);
    }
  }

  async function checkoutBlock(blockId: string) {
    track(AnalyticEvent.CLICK_CHECKOUT_SNAPSHOT);

    if (!projectId) {
      return;
    }
    const isSnapshotEnabled = currentProject?.project?.emulator?.snapshot;
    if (!isSnapshotEnabled) {
      toast.error(
        "Can't revert, because 'snapshot' option is not enabled in settings"
      );
      return;
    }
    const block = blocks.find((block) => block.id === blockId);
    showDialog({
      title: "Jump to snapshot",
      body: (
        <span style={{ textAlign: "center" }}>
          Do you want to move to the emulator blockchain state to the block with
          height <code>{block?.height}</code>?
        </span>
      ),
      confirmBtnLabel: "REVERT",
      cancelBtnLabel: "CANCEL",
      onConfirm: async () => {
        track(AnalyticEvent.CHECKOUT_SNAPSHOT);

        try {
          const snapshot = await snapshotService.checkoutBlock({
            blockId,
            projectId,
          });
          fetchAll();
          toast.success(
            `Moved to snapshot "${snapshot.snapshot?.description}"`
          );
        } catch (e) {
          handleError(e);
        }
      },
    });
  }

  return (
    <ProjectActionsContext.Provider
      value={{
        isSwitching,
        switchProject,
        createSnapshot,
        sendTransaction,
        isRemovingProject,
        checkoutBlock,
        removeProject,
      }}
    >
      <TransactionDialog show={showTxDialog} setShow={setShowTxDialog} />
      <SnapshotDialog show={showSnapshotModal} setShow={setShowSnapshotModal} />
      {children}
    </ProjectActionsContext.Provider>
  );
}

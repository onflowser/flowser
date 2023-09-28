import React, {
  createContext,
  ReactElement,
  useCallback,
  useContext,
  useState,
  useMemo,
} from "react";
import toast from "react-hot-toast";
import { Block, EmulatorSnapshot } from "@flowser/shared";
import { useConfirmDialog } from "./confirm-dialog.context";
import { ServiceRegistry } from "../services/service-registry";
import {
  useGetPollingBlocks,
  useGetPollingEmulatorSnapshots,
} from "../hooks/use-api";
import { useErrorHandler } from "../hooks/use-error-handler";
import { useAnalytics } from "../hooks/use-analytics";
import { AnalyticEvent } from "../services/analytics.service";
import { FlowUtils } from "../utils/flow-utils";
import { SnapshotDialog } from "components/overlays/dialogs/snapshot/SnapshotDialog";
import { useProjectManager } from "./projects.context";

export type SnapshotsManager = {
  createSnapshot: () => void;
  checkoutBlock: (blockId: string) => void;
};

const SnapshotsManagerContext = createContext<SnapshotsManager>(
  {} as SnapshotsManager
);

export function SnapshotsManagerProvider({
  children,
}: {
  children: ReactElement;
}): ReactElement {
  const { snapshotService } = ServiceRegistry.getInstance();

  const { track } = useAnalytics();
  const { handleError } = useErrorHandler(SnapshotsManagerProvider.name);
  const { showDialog } = useConfirmDialog();
  const { currentProject } = useProjectManager();
  const { data: blocks, refresh } = useGetPollingBlocks();
  const { data: emulatorSnapshots } = useGetPollingEmulatorSnapshots();
  const snapshotLookupByBlockId = useMemo(
    () =>
      new Map(
        emulatorSnapshots.map((snapshot) => [snapshot.blockId, snapshot])
      ),
    [emulatorSnapshots]
  );
  const [showSnapshotModal, setShowSnapshotModal] = useState(false);

  function createSnapshot() {
    track(AnalyticEvent.CREATE_SNAPSHOT);

    const { snapshot } = currentProject?.emulator ?? {};
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

  function checkoutSnapshot(snapshot: EmulatorSnapshot) {
    const isSnapshotEnabled = currentProject?.emulator?.snapshot;
    if (!isSnapshotEnabled) {
      toast.error(
        "Can't jump to block, because 'snapshot' option is not enabled in project settings"
      );
      return;
    }

    const latestBlock = blocks[0];

    if (snapshot.blockId === latestBlock.id) {
      toast("Blockchain state is already at this block, doing nothing.");
      return;
    }

    const onConfirm = async () => {
      track(AnalyticEvent.CHECKOUT_SNAPSHOT);

      if (!currentProject) {
        throw new Error("Expected project to be defined");
      }

      try {
        await snapshotService.checkoutBlock({
          blockId: snapshot.blockId,
          projectId: currentProject.id,
        });
        refresh();
        toast.success(
          `Moved to block: ${FlowUtils.getShortedBlockId(snapshot.blockId)}`
        );
      } catch (e) {
        handleError(e);
      }
    };

    showDialog({
      title: "Jump to snapshot",
      body: (
        <span style={{ textAlign: "center" }}>
          Do you want to move the emulator blockchain state to the snapshot{" "}
          <code>{snapshot.description}</code>?
        </span>
      ),
      confirmButtonLabel: "JUMP",
      cancelButtonLabel: "CANCEL",
      onConfirm,
    });
  }

  function rollbackToBlock(targetBlock: Block) {
    const onConfirm = async () => {
      track(AnalyticEvent.CHECKOUT_SNAPSHOT);

      const latestBlock = blocks[0];

      if (targetBlock.id === latestBlock.id) {
        toast("Blockchain state is already at this block, doing nothing.");
        return;
      }
      if (!currentProject) {
        throw new Error("Expected project to be defined");
      }

      try {
        await snapshotService.rollback({
          blockHeight: targetBlock.height,
        });
        refresh();
        toast.success(
          `Moved to block: ${FlowUtils.getShortedBlockId(targetBlock.id)}`
        );
      } catch (e) {
        handleError(e);
      }
    };

    showDialog({
      title: "Rollback to block",
      body: (
        <span style={{ textAlign: "center" }}>
          Do you want to move the emulator blockchain state to the block with
          height <code>{targetBlock.height}</code>?
        </span>
      ),
      confirmButtonLabel: "JUMP",
      cancelButtonLabel: "CANCEL",
      onConfirm,
    });
  }

  const checkoutBlock = useCallback(
    (targetBlockId: string) => {
      track(AnalyticEvent.CLICK_CHECKOUT_SNAPSHOT);

      const snapshot = snapshotLookupByBlockId.get(targetBlockId);

      if (snapshot) {
        return checkoutSnapshot(snapshot);
      }

      const targetBlock = blocks.find((block) => block.id === targetBlockId);

      if (!targetBlock) {
        throw new Error(`Expected to find block with ID: ${targetBlockId}`);
      }

      rollbackToBlock(targetBlock);
    },
    [currentProject, blocks, snapshotLookupByBlockId]
  );

  return (
    <SnapshotsManagerContext.Provider
      value={{
        createSnapshot,
        checkoutBlock,
      }}
    >
      <SnapshotDialog show={showSnapshotModal} setShow={setShowSnapshotModal} />
      {children}
    </SnapshotsManagerContext.Provider>
  );
}

export function useSnapshotsManager(): SnapshotsManager {
  return useContext(SnapshotsManagerContext);
}

import React, {
  createContext,
  ReactElement,
  useCallback,
  useContext,
  useState,
  useMemo,
} from "react";
import toast from "react-hot-toast";
import { useConfirmDialog } from "./confirm-dialog.context";
import { useErrorHandler } from "../hooks/use-error-handler";
import { AnalyticEvent, useAnalytics } from "../hooks/use-analytics";
import { FlowUtils } from "../utils/flow-utils";
import { SnapshotDialog } from "../common/overlays/dialogs/snapshot/SnapshotDialog";
import { useProjectManager } from "./workspace.context";
import { FlowBlock, FlowStateSnapshot } from "@onflowser/api";
import { useServiceRegistry } from "./service-registry.context";
import { useGetBlocks, useGetStateSnapshots } from "../api";

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
  const { snapshotService } = useServiceRegistry();

  const { track } = useAnalytics();
  const { handleError } = useErrorHandler(SnapshotsManagerProvider.name);
  const { showDialog } = useConfirmDialog();
  const { currentWorkspace } = useProjectManager();
  const { data: blocks, mutate } = useGetBlocks();
  const { data: stateSnapshots } = useGetStateSnapshots();
  const snapshotLookupByBlockId = useMemo(
    () =>
      new Map(stateSnapshots?.map((snapshot) => [snapshot.blockId, snapshot])),
    [stateSnapshots]
  );
  const [showSnapshotModal, setShowSnapshotModal] = useState(false);

  function createSnapshot() {
    track(AnalyticEvent.CREATE_SNAPSHOT);

    const { snapshot } = currentWorkspace?.emulator ?? {};
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

  function checkoutSnapshot(snapshot: FlowStateSnapshot) {
    const isSnapshotEnabled = currentWorkspace?.emulator?.snapshot;
    if (!isSnapshotEnabled) {
      toast.error(
        "Can't jump to block, because 'snapshot' option is not enabled in project settings"
      );
      return;
    }

    if (blocks === undefined) {
      throw new Error("No blocks found");
    }

    const latestBlock = blocks[0];

    if (snapshot.blockId === latestBlock.id) {
      toast("Blockchain state is already at this block, doing nothing.");
      return;
    }

    const onConfirm = async () => {
      track(AnalyticEvent.CHECKOUT_SNAPSHOT);

      if (!currentWorkspace) {
        throw new Error("Expected project to be defined");
      }

      try {
        await snapshotService.checkoutBlock({
          blockId: snapshot.blockId,
          projectId: currentWorkspace.id,
        });
        mutate();
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

  function rollbackToBlock(targetBlock: FlowBlock) {
    const onConfirm = async () => {
      track(AnalyticEvent.CHECKOUT_SNAPSHOT);

      if (blocks === undefined) {
        throw new Error("No blocks found");
      }

      const latestBlock = blocks[0];

      if (targetBlock.id === latestBlock.id) {
        toast("Blockchain state is already at this block, doing nothing.");
        return;
      }
      if (!currentWorkspace) {
        throw new Error("Expected project to be defined");
      }

      try {
        await snapshotService.rollback({
          blockHeight: targetBlock.height,
        });
        mutate();
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

      if (blocks === undefined) {
        throw new Error("No blocks found");
      }

      const targetBlock = blocks.find((block) => block.id === targetBlockId);

      if (!targetBlock) {
        throw new Error(`Expected to find block with ID: ${targetBlockId}`);
      }

      rollbackToBlock(targetBlock);
    },
    [currentWorkspace, blocks, snapshotLookupByBlockId]
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

import React, { FunctionComponent, useEffect, useMemo } from "react";
import { NavLink } from "react-router-dom";
import { useFormattedDate } from "../../../hooks/use-formatted-date";
import { useFilterData } from "../../../hooks/use-filter-data";
import { useSearch } from "../../../hooks/use-search";
import Card from "../../../components/card/Card";
import Label from "../../../components/label/Label";
import Value from "../../../components/value/Value";
import classes from "./Main.module.scss";
import Ellipsis from "../../../components/ellipsis/Ellipsis";
import { useNavigation } from "../../../hooks/use-navigation";
import NoResults from "../../../components/no-results/NoResults";
import FullScreenLoading from "../../../components/fullscreen-loading/FullScreenLoading";
import {
  useGetPollingBlocks,
  useGetPollingEmulatorSnapshots,
} from "../../../hooks/use-api";
import { toast } from "react-hot-toast";
import { SnapshotService } from "../../../services/snapshots.service";
import { SimpleButton } from "../../../components/simple-button/SimpleButton";

const Main: FunctionComponent = () => {
  const emulatorSnapshotService = SnapshotService.getInstance();
  const { searchTerm, setPlaceholder, disableSearchBar } = useSearch();
  const { showNavigationDrawer, showSubNavigation } = useNavigation();
  const { formatDate } = useFormattedDate();
  const { data: blocks, firstFetch, fetchAll } = useGetPollingBlocks();
  const { data: emulatorSnapshots } = useGetPollingEmulatorSnapshots();
  const { filteredData } = useFilterData(blocks, searchTerm);
  const snapshotLookupByBlockId = useMemo(
    () =>
      new Map(
        emulatorSnapshots.map((snapshot) => [snapshot.blockId, snapshot])
      ),
    [emulatorSnapshots]
  );

  async function onRevertToBlock(blockId: string) {
    try {
      const snapshot = await emulatorSnapshotService.revertTo({
        blockId,
      });
      fetchAll();
      toast.success(`Reverted to "${snapshot.data.snapshot?.description}"`);
    } catch (e) {
      console.error(e);
      toast.error("Failed to revert to block");
    }
  }

  useEffect(() => {
    setPlaceholder("Search for block ids, parent ids, time, ...");
    showNavigationDrawer(false);
    showSubNavigation(true);
    disableSearchBar(false);
  }, []);

  return (
    <>
      {filteredData.map((item) => (
        <Card
          key={item.id}
          showIntroAnimation={item.isNew || item.isUpdated}
          className={classes.card}
        >
          <div>
            <Label>BLOCK HEIGHT</Label>
            <Value>{item.height}</Value>
          </div>
          <div>
            <Label>BLOCK ID</Label>
            <Value>
              <NavLink to={`/blocks/details/${item.id}`}>
                <Ellipsis className={classes.hash}>{item.id}</Ellipsis>
              </NavLink>
            </Value>
          </div>
          <div>
            <Label>TIME</Label>
            <Value>{formatDate(item.timestamp)}</Value>
          </div>
          <div>
            <Label>COLLECTION GUARANTEES</Label>
            <Value>{item.collectionGuarantees?.length}</Value>
          </div>
          <div>
            <Label>BLOCK SEALS</Label>
            <Value>{item.blockSeals?.length}</Value>
          </div>
          <div>
            <Label>SIGNATURES</Label>
            <Value>{item.signatures?.length}</Value>
          </div>
          <div>
            <Label>SNAPSHOT</Label>
            <Value>
              <SimpleButton onClick={() => onRevertToBlock(item.id)}>
                {snapshotLookupByBlockId.get(item.id)?.description ?? "-"}
              </SimpleButton>
            </Value>
          </div>
        </Card>
      ))}
      {!firstFetch && <FullScreenLoading />}
      {firstFetch && filteredData.length === 0 && (
        <NoResults className={classes.noResults} />
      )}
    </>
  );
};

export default Main;

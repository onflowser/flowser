import React, { FunctionComponent, useCallback, useState } from "react";
import Card from "../../../components/card/Card";
import classes from "./Storage.module.scss";
import Value from "../../../components/value/Value";
import { useSyntaxHighlighter } from "../../../hooks/use-syntax-highlighter";

export interface StorageData {
  blockHeight: number;
  name: string;
  value: string;
}

interface OwnProps {
  data: StorageData[];
}

type Props = OwnProps;

const Storage: FunctionComponent<Props> = ({ data }) => {
  const [tabIndex, setTabIndex] = useState(0);
  const { highlightJsonSyntax } = useSyntaxHighlighter();
  const selectTab = (tabIndex: number) => setTabIndex(tabIndex);

  const formatStorageName = (name: string) => {
    return name.replace("storage/", "");
  };

  const getFormattedStorageData = useCallback(() => {
    const CONTRACT_ADDRESS = 1;
    const CONTRACT_NAME = 2;
    const RESOURCE_NAME = 3;
    const d = data[tabIndex];

    try {
      // example: 'A.f8d6e0586b0a20c7.KittyItems.Collection(uuid: 25, ownedNFTs: {})'
      const value = d.value.split(".");
      const contractName = value[CONTRACT_NAME];
      const contractAddress = value[CONTRACT_ADDRESS];
      const blockHeight = d.blockHeight;
      const resource = value[RESOURCE_NAME].split("(");
      const resourceName = resource[0];
      const resourceValues = resource[1].replace(")", "").split(",");

      return {
        "Contract Name": contractName,
        "Contract Address": contractAddress,
        "Resource Name": resourceName,
        "Block Height": blockHeight,
        Values: resourceValues.reduce((acc: any, curr: string) => {
          const splitted = curr.trim().split(":");
          acc[splitted[0].trim()] = splitted[1].trim();
          return acc;
        }, {}),
      };
    } catch (e) {
      return d;
    }
  }, [tabIndex]);

  return (
    <div className={classes.root}>
      <div className={classes.listItems}>
        {data.map((storageData: StorageData, i: number) => (
          <Card
            key={i}
            variant="black"
            onClick={() => selectTab(i)}
            className={`${classes.tab} ${i === tabIndex ? classes.active : ""}`}
          >
            <Value>
              <a>{formatStorageName(storageData.name)}</a>
            </Value>
          </Card>
        ))}
      </div>
      <Card variant="black" className={classes.storageContent}>
        <code>
          <pre
            dangerouslySetInnerHTML={{
              __html: highlightJsonSyntax(getFormattedStorageData()),
            }}
          ></pre>
        </code>
      </Card>
    </div>
  );
};

export default Storage;

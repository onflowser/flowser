import { FlowContract } from "@onflowser/api";
import classes from "./ContractName.module.scss"
import { useGetTokenMetadataList } from "../../api";

type ContractNameProps = {
  contract: FlowContract;
};

export function ContractName(props: ContractNameProps) {
  const { contract } = props;
  const { data } = useGetTokenMetadataList();
  const metadata = data?.find(token => token.contractName === contract.name);

  return (
    <div className={classes.root}>
      <span>{contract.name}</span>
      {metadata && (
        <img
          style={{ height: 20, width: 20 }}
          alt="Token logo"
          src={metadata.logoURI}
        />
      )}
    </div>
  );
}

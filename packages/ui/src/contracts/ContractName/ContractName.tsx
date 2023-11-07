import { FlowContract } from "@onflowser/api";
import classes from "./ContractName.module.scss";
import { useGetTokenMetadataList } from "../../api";
import { TokenIcon } from "../../common/icons/TokenIcon/TokenIcon";

type ContractNameProps = {
  contract: FlowContract;
};

export function ContractName(props: ContractNameProps) {
  const { contract } = props;
  const { data: tokenMetadataList } = useGetTokenMetadataList();
  const tokenMetadata = tokenMetadataList?.find(
    (token) => token.contractName === contract.name,
  );

  return (
    <div className={classes.root}>
      <span>{contract.name}</span>
      {tokenMetadata && <TokenIcon token={tokenMetadata} />}
    </div>
  );
}

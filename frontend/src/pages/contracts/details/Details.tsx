import React, { FunctionComponent, useEffect } from "react";
import { NavLink, useParams } from "react-router-dom";
import { Breadcrumb, useNavigation } from "../../../hooks/use-navigation";
import FullScreenLoading from "@flowser/ui/fullscreen-loading/FullScreenLoading";
import { useGetContract } from "../../../hooks/use-api";
import classes from "./Details.module.scss";
import { TableCard, DetailsCardColumn } from "components/cards/table/TableCard";
import { TextUtils } from "../../../utils/text-utils";
import { SizedBox } from "@flowser/uimisc/SizedBox";
import { CadenceEditor } from "@flowser/ui/code/cadence/CadenceEditor";

type RouteParams = {
  contractId: string;
};

const Details: FunctionComponent = () => {
  const { contractId } = useParams<RouteParams>();
  const { setBreadcrumbs, showSearchBar } = useNavigation();
  const { showNavigationDrawer } = useNavigation();
  const { isLoading, data } = useGetContract(contractId);
  const { contract } = data ?? {};

  const breadcrumbs: Breadcrumb[] = [
    { to: "/contracts", label: "Contracts" },
    { label: "Details" },
  ];

  useEffect(() => {
    showNavigationDrawer(true);
    setBreadcrumbs(breadcrumbs);
    showSearchBar(false);
  }, []);

  if (isLoading || !contract) {
    return <FullScreenLoading />;
  }

  const detailsColumns: DetailsCardColumn[] = [
    [
      {
        label: "Name",
        value: contract.name,
      },
      {
        label: "Account",
        value: (
          <NavLink to={`/accounts/details/${contract.accountAddress}`}>
            {contract.accountAddress}
          </NavLink>
        ),
      },
      {
        label: "Updated date",
        value: TextUtils.longDate(contract.updatedAt),
      },
      {
        label: "Created date",
        value: TextUtils.longDate(contract.createdAt),
      },
    ],
  ];

  return (
    <div className={classes.root}>
      <TableCard columns={detailsColumns} />
      <SizedBox height={30} />
      <CadenceEditor value={contract.code} editable={false} />
    </div>
  );
};

export default Details;

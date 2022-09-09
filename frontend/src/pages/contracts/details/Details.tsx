import React, { FunctionComponent, useEffect } from "react";
import { NavLink, useParams } from "react-router-dom";
import Label from "../../../components/label/Label";
import Value from "../../../components/value/Value";
import ContentDetailsScript from "../../../components/content-details-script/ContentDetailsScript";
import { Breadcrumb, useNavigation } from "../../../hooks/use-navigation";
import FullScreenLoading from "../../../components/fullscreen-loading/FullScreenLoading";
import { useGetContract } from "../../../hooks/use-api";
import Card from "components/card/Card";
import classes from "./Details.module.scss";
import {
  DetailsCard,
  DetailsCardProps,
} from "components/details-card/DetailsCard";

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

  const detailsColumns: DetailsCardProps = {
    columns: [
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
      ],
    ],
  };

  return (
    <div className={classes.root}>
      <DetailsCard columns={detailsColumns.columns} />
      <ContentDetailsScript script={contract.code} />
    </div>
  );
};

export default Details;

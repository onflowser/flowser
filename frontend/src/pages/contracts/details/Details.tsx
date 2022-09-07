import React, { FunctionComponent, useEffect } from "react";
import { NavLink, useParams } from "react-router-dom";
import Label from "../../../components/label/Label";
import Value from "../../../components/value/Value";
import DetailsCard from "../../../components/details-card/DetailsCard";
import ContentDetailsScript from "../../../components/content-details-script/ContentDetailsScript";
import { Breadcrumb, useNavigation } from "../../../hooks/use-navigation";
import FullScreenLoading from "../../../components/fullscreen-loading/FullScreenLoading";
import { useGetContract } from "../../../hooks/use-api";
import Card from "components/card/Card";
import classes from "./Details.module.scss";

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

  return (
    <div className={classes.root}>
      <Card className={classes.bigCard}>
        <div className={classes.bigCardContent}>
          <div>
            <Label variant="medium" className={classes.label}>
              Name
            </Label>
            <Value variant="small" className={classes.value}>
              {contract.name}
            </Value>
          </div>
          <div>
            <Label variant="medium" className={classes.label}>
              Account
            </Label>
            <Value variant="small" className={classes.value}>
              <NavLink to={`/accounts/details/${contract.accountAddress}`}>
                {contract.accountAddress}
              </NavLink>
            </Value>
          </div>
        </div>
      </Card>
      <ContentDetailsScript script={contract.code} />
    </div>
  );
};

export default Details;

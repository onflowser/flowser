import { TokenInfo } from "flow-native-token-registry";
import React from "react";
import { ExternalLink } from "../../links/ExternalLink/ExternalLink";

type TokenIconProps = {
  token: TokenInfo;
}

export function TokenIcon(props: TokenIconProps) {
  const {token} = props;
  const link = token.extensions?.website ?? token.extensions?.github ?? token.extensions?.explorer;

  if (link) {
    return (
      <ExternalLink href={link} inline>
        <Icon {...props} />
      </ExternalLink>
    )
  } else {
    return <Icon {...props} />;
  }
}

function Icon(props: TokenIconProps) {
  return (
    <img
      style={{ height: 20, width: 20 }}
      alt="Token logo"
      src={props.token.logoURI}
    />
  )
}

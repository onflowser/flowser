import React from "react";
import { ReactElement, useEffect } from "react";
import { CadenceValueBuilder } from "../interface";
import SelectInput, {
  SelectInputOption,
} from "../../../../common/inputs/SelectInput/SelectInput";
import { Input } from "../../../../common/inputs/Input/Input";
import { FclPathDomain, FclValueUtils } from '@onflowser/core';

export function PathBuilder(props: CadenceValueBuilder): ReactElement {
  const { disabled, type, value, setValue } = props;

  const isInitialized = FclValueUtils.isFclPathValue(value);
  const specifiedDomain = getPredefinedDomain(type);

  // TODO(polish): Don't trigger this hook on every rerender
  //  See: https://www.notion.so/flowser/Sometimes-arguments-don-t-get-initialized-properly-80c34018155646d08e4da0bc6c977ed9?pvs=4
  useEffect(() => {
    if (!isInitialized) {
      setValue({
        domain: specifiedDomain ?? "public",
        identifier: "",
      });
    }
  });

  if (!isInitialized) {
    return <></>;
  }

  function setDomain(domain: FclPathDomain) {
    if (isInitialized) {
      setValue({
        ...value,
        domain,
      });
    }
  }

  function setIdentifier(identifier: string) {
    if (isInitialized) {
      setValue({
        ...value,
        identifier,
      });
    }
  }

  const options = getAvailableDomains(type).map(
    (domain): SelectInputOption => ({
      label: domain,
      value: domain,
    })
  );

  return (
    <div>
      Domain:{" "}
      <SelectInput
        disabled={specifiedDomain !== undefined || disabled}
        value={value.domain}
        options={options}
        onChange={(e) => setDomain(e.target.value as FclPathDomain)}
      />
      Identifier:{" "}
      <Input
        disabled={disabled}
        value={value.identifier}
        onChange={(e) => setIdentifier(e.target.value)}
      />
    </div>
  );
}

// Converts path subtype to a predefined domain.
// In case domain is not specified, `undefined` is returned.
// See path sub-type structure:
// https://developers.flow.com/cadence/language/accounts#paths
function getPredefinedDomain(type: CadenceType): FclPathDomain | undefined {
  switch (type.rawType) {
    case "StoragePath":
      return "storage";
    case "PublicPath":
      return "public";
    case "PrivatePath":
      return "private";
    case "Path":
    case "CapabilityPath":
      return undefined;
    default:
      throw new Error("Unknown raw path type: " + type.rawType);
  }
}

// Retrieves the available list of domains for a path type.
// See path sub-type structure:
// https://developers.flow.com/cadence/language/accounts#paths
function getAvailableDomains(type: CadenceType): FclPathDomain[] {
  switch (type.rawType) {
    case "StoragePath":
      return ["storage"];
    case "PublicPath":
      return ["public"];
    case "PrivatePath":
      return ["private"];
    case "Path":
      return ["public", "private", "storage"];
    case "CapabilityPath":
      return ["public", "private"];
    default:
      throw new Error("Unknown raw path type: " + type.rawType);
  }
}

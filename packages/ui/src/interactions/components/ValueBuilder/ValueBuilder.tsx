import React from "react";
import { ReactElement } from "react";
import { CadenceValueBuilder } from "./interface";
import { TextualBuilder } from "./TextualBuilder/TextualBuilder";
import { FixedPointNumberBuilder } from "./FixedPointNumberBuilder/FixedPointNumberBuilder";
import { ArrayBuilder } from "./ArrayBuilder/ArrayBuilder";
import { AddressBuilder } from "./AddressBuilder/AddressBuilder";
import { DictionaryBuilder } from "./DictionaryBuilder/DictionaryBuilder";
import { PathBuilder } from "./PathBuilder/PathBuilder";
import { BoolBuilder } from "./BoolBuilder/BoolBuilder";
import { Callout } from "../../../common/misc/Callout/Callout";
import { ExternalLink } from "../../../common/links/ExternalLink/ExternalLink";
import { FlowserIcon } from "../../../common/icons/FlowserIcon";
import { IntegerNumberBuilder } from "./IntegerNumberBuilder/IntegerNumberBuilder";
import { CadenceTypeKind } from "@onflowser/api";

export function ValueBuilder(props: CadenceValueBuilder): ReactElement {
  const { type } = props;
  switch (type.kind) {
    case CadenceTypeKind.CADENCE_TYPE_ADDRESS:
      return <AddressBuilder {...props} />;
    case CadenceTypeKind.CADENCE_TYPE_TEXTUAL:
      return <TextualBuilder {...props} />;
    case CadenceTypeKind.CADENCE_TYPE_INTEGER_NUMBER:
      return <IntegerNumberBuilder {...props} />;
    case CadenceTypeKind.CADENCE_TYPE_FIXED_POINT_NUMBER:
      return <FixedPointNumberBuilder {...props} />;
    case CadenceTypeKind.CADENCE_TYPE_ARRAY:
      return <ArrayBuilder {...props} />;
    case CadenceTypeKind.CADENCE_TYPE_DICTIONARY:
      return <DictionaryBuilder {...props} />;
    case CadenceTypeKind.CADENCE_TYPE_PATH:
      return <PathBuilder {...props} />;
    case CadenceTypeKind.CADENCE_TYPE_BOOLEAN:
      return <BoolBuilder {...props} />;
    default:
      return <UnknownType />;
  }
}

function UnknownType() {
  return (
    <Callout
      icon={<FlowserIcon.QuestionMark width={15} height={15} />}
      title="Unsupported data type"
      description={
        <div>
          For now, we only support built-in Cadence data types.
          <ExternalLink href="https://developers.flow.com/cadence/language/values-and-types">
            Value and types
          </ExternalLink>
        </div>
      }
    />
  );
}

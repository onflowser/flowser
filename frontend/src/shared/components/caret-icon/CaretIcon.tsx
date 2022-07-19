import React, {
  FunctionComponent,
  useCallback,
  useEffect,
  useState,
} from "react";
import { ReactComponent as CaretIconSvg } from "../../assets/icons/caret.svg";
import classes from "./CaretIcon.module.scss";

interface OwnProps {
  isOpen?: boolean;
  onChange?: (isOpen: boolean) => void;
  inverted?: boolean; // Close state is upside orientated instead of downside orientated

  [key: string]: any;
}

type Props = OwnProps;

const CaretIcon: FunctionComponent<Props> = ({
  isOpen = false,
  onChange = () => false,
  inverted = false,
  ...restProps
}) => {
  const [state, setState] = useState(isOpen);

  useEffect(() => {
    setState(isOpen);
  }, [isOpen]);

  const onToggle = () => {
    setState(!state);
    onChange(state);
  };

  return (
    <CaretIconSvg
      className={`${classes.root} ${restProps.className} ${
        state ? classes.isOpen : ""
      } ${inverted ? classes.inverted : ""}`}
      onClick={onToggle}
    />
  );
};

export default CaretIcon;

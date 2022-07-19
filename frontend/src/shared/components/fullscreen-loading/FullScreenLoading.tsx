import React, { FC, useEffect, useState } from "react";
import Logo from "../../assets/images/logo.svg";
import classes from "./FullScreenLoading.module.scss";

type Props = {
  dotInterval?: number;
  className?: string;
};

const FullScreenLoading: FC<Props> = ({ dotInterval = 300, className }) => {
  const [dots, setDots] = useState("");

  useEffect(() => {
    const dotArray = [".", "..", "...", "...."];
    let count = 0;
    const interval = setInterval(() => {
      count++;
      setDots(dotArray[count % dotArray.length]);
    }, dotInterval);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className={`${classes.container} ${className}`}>
      <img className={classes.logo} src={Logo} alt="FLOWSER" />
      <p className={classes.text}>Loading {dots}</p>
    </div>
  );
};

export default FullScreenLoading;

import classes from './Code.module.scss';
import React, { FC } from 'react';

type Props = {
    code?: string;
};

const Code: FC<Props> = ({ code }) => {
    return <pre className={classes.code}>{code}</pre>;
};

export default Code;

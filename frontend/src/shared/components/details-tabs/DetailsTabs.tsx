import React, { FunctionComponent, MouseEventHandler, ReactElement, useState } from 'react';
import classes from './DetailsTabs.module.scss';
import Card from '../card/Card';
import Label from '../label/Label';
import Value from '../value/Value';

type TabItemProps = {
    label: string;
    value: string | number;
    children?: any;
    onClick?: MouseEventHandler;
};

type ContainerProps = {
    children: ReactElement<TabItemProps, 'DetailsTabItem'>[] | any;
};

export const DetailsTabs: FunctionComponent<ContainerProps> = ({ children }) => {
    const [selected, setSelected] = useState(0);
    const noNilChildren = children.filter((c: any) => !!c);
    console.log({ noNilChildren });
    const selectedChildren = noNilChildren[selected].props.children;

    return (
        <>
            <div className={classes.cardsContainer}>
                {noNilChildren.map((child: any, index: number) => {
                    const isDisabled = !child.props.children;
                    return (
                        <Card
                            key={index}
                            active={selected === index}
                            className={`${classes.smallCard} ${isDisabled ? classes.smallCard__disabled : ''}`}
                            onClick={(e: any) => {
                                if (!isDisabled) setSelected(index);
                                if (child.props.onClick) child.props.onClick(e);
                            }}
                        >
                            <Label variant="medium">{child.props.label}</Label>
                            <Value variant="large">{child.props.value}</Value>
                        </Card>
                    );
                })}
            </div>
            <div className={classes.contentDetailsContainer}>{selectedChildren}</div>
        </>
    );
};

export const DetailsTabItem: FunctionComponent<TabItemProps> = ({ children }) => children;

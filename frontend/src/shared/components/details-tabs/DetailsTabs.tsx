import React, { FunctionComponent, MouseEventHandler, ReactElement, useEffect, useState } from 'react';
import classes from './DetailsTabs.module.scss';
import Card from '../card/Card';
import Label from '../label/Label';
import Value from '../value/Value';
import CaretIcon from '../caret-icon/CaretIcon';

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
    const noNilChildren = children.filter((c: any) => !!c);
    const selectedIndex = noNilChildren.findIndex((c: any) => c.props?.children);
    const [selected, setSelected] = useState(selectedIndex);
    const selectedChildren = noNilChildren[selected].props.children;
    const [childContent, setChildContent] = useState(selectedChildren);

    useEffect(() => {
        setChildContent(noNilChildren[selected].props.children);
    }, [selected]);

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
                            <div className={classes.labelValue}>
                                <Label variant="medium">{child.props.label}</Label>
                                <Value variant="large" className={`${!isDisabled ? classes.clickable : ''}`}>
                                    {child.props.value}
                                </Value>
                            </div>
                            {!isDisabled && (
                                <div className={classes.caret}>
                                    <CaretIcon isOpen={selected === index} />
                                </div>
                            )}
                        </Card>
                    );
                })}
            </div>
            <div className={classes.contentDetailsContainer}>{childContent}</div>
        </>
    );
};

export const DetailsTabItem: FunctionComponent<TabItemProps> = ({ children }) => children;

import React, { FunctionComponent, useEffect, useRef, useState } from 'react';

interface OwnProps {
    children: string;
    ellipsis?: string;

    [key: string]: any;
}

type Props = OwnProps;

const Ellipsis: FunctionComponent<Props> = ({ children, ellipsis = '...', ...restProps }) => {
    const elRef = useRef(null);
    const [state, setState] = useState(children);

    useEffect(() => {
        const resize = () => {
            setState(children);
            const offsetWidth = elRef.current ? (elRef.current as any).offsetWidth : 0;
            const scrollWidth = elRef.current ? (elRef.current as any).scrollWidth : 0;
            if (offsetWidth < scrollWidth) {
                const charWidth = Math.ceil(scrollWidth / children.length);
                const hiddenLength = Math.ceil(scrollWidth - offsetWidth);
                const numCharsRemove = Math.ceil(hiddenLength / charWidth) + ellipsis?.length;
                const half = Math.ceil((children.length - numCharsRemove) / 2) - 4;
                const ellipsisText = children.substr(0, half) + ellipsis + children.substring(children.length - half);
                setState(ellipsisText);
            }
        };

        resize();
        window.addEventListener('resize', resize);
        return () => {
            window.removeEventListener('resize', resize);
        };
    }, []);

    return (
        <span ref={elRef} className={`${restProps.className}`}>
            {state}
        </span>
    );
};

export default Ellipsis;

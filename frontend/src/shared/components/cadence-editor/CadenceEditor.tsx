import React, { createRef, FC } from 'react';
import TextArea from '../text-area/TextArea';

type Props = {
    value: string;
    onChange: (value: string) => void;
};

const CadenceEditor: FC<Props> = ({ value, onChange }) => {
    const ref = createRef<HTMLTextAreaElement>();

    function onTextAreaKeyDown(e: any) {
        if (e.code === 'Tab') {
            // prevent default "focus next input" behaviour
            // to enable cadence code indentation
            e.preventDefault();
            if (!ref.current) return;
            const start = ref.current.selectionStart;
            const end = ref.current.selectionEnd;

            // set textarea value to: text before caret + tab + text after caret
            ref.current.value = ref.current.value.substring(0, start) + '\t' + ref.current.value.substring(end);

            // put caret at right position again
            ref.current.selectionStart = ref.current.selectionEnd = start + 1;

            onChange(ref.current.value);
        }
    }

    return (
        <TextArea
            ref={ref}
            rows={10}
            placeholder="Cadence code"
            value={value}
            onKeyDown={onTextAreaKeyDown}
            onChange={(e: any) => onChange(e.target.value)}
        />
    );
};

export default CadenceEditor;

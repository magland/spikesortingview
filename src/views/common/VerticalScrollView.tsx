import React, { FunctionComponent, useMemo } from 'react';

type Props = {
    width: number
    height: number
}

const VerticalScrollView: FunctionComponent<Props> = ({width, height, children}) => {
    const divStyle: React.CSSProperties = useMemo(() => ({
        width: width - 20, // leave room for the scrollbar
        height,
        position: 'relative',
        overflowY: 'auto'
    }), [width, height])
    return (
        <div style={divStyle}>
            {children}
        </div>
    )
}

export default VerticalScrollView
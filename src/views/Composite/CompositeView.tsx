import React, { FunctionComponent, useMemo } from 'react';
import { CompositeViewData } from './CompositeViewData';
import ViewWrapper from './ViewWrapper';

type Props = {
    data: CompositeViewData
    width: number
    height: number
}

const CompositeView: FunctionComponent<Props> = ({data, width, height}) => {
    const divStyle: React.CSSProperties = useMemo(() => ({
        width,
        height,
        overflowX: 'hidden',
        overflowY: 'auto'
    }), [width, height])
    
    return (
        <div style={divStyle}>
            {
                data.views.map((view, ii) => (
                    <div key={ii}>
                        <h3>{view.label}</h3>
                        <ViewWrapper
                            figureDataSha1={view.figureDataSha1}
                            width={width}
                            height={view.defaultHeight || 600}
                        />
                    </div>
                ))
            }
        </div>
    )
}

export default CompositeView
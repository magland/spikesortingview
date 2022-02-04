import React, { FunctionComponent, useMemo } from 'react';
import { MultiTimeseriesViewData } from './MultiTimeseriesViewData';
import ViewWrapper from './ViewWrapper';

type Props = {
    data: MultiTimeseriesViewData
    width: number
    height: number
}

const MultiTimeseriesView: FunctionComponent<Props> = ({data, width, height}) => {
    const divStyle: React.CSSProperties = useMemo(() => ({
        width,
        height,
        overflowX: 'hidden',
        overflowY: 'auto'
    }), [width, height])

    const total_height_allocated = data.panels.reduce((total, panel) => total + (panel?.relativeHeight ?? 1), 0)
    const unit_height = Math.floor(height / total_height_allocated)

    return (
        <div style={divStyle}>
            {
                data.panels.map((panel, ii) => (
                    <div key={ii}>
                        <ViewWrapper
                            label={panel.label}
                            figureDataSha1={panel.figureDataSha1}
                            isBottomPanel={ii === (data.panels.length - 1)}
                            width={width}
                            height={Math.floor(unit_height * (panel?.relativeHeight ?? 1))}
                        />
                    </div>
                ))
            }
        </div>
    )
}

export default MultiTimeseriesView
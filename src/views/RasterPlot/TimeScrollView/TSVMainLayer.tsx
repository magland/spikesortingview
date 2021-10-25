import BaseCanvas from 'FigurlCanvas/BaseCanvas';
import React, { FunctionComponent, useMemo } from 'react';
import { paint } from './paint';
import { TimeScrollViewPanel } from './TimeScrollView';

export type MainLayerProps = {
    panels: TimeScrollViewPanel[]
    timeRange: [number, number]
    margins: {left: number, right: number, top: number, bottom: number}
    panelSpacing: number,
    width: number
    height: number
}

const TSVMainLayer: FunctionComponent<MainLayerProps> = ({width, height, panels, panelSpacing, timeRange, margins}) => {
    const drawData = useMemo(() => ({
        width, height, panels, panelSpacing, timeRange, margins,
        layer: 'main' as 'axes' | 'main'
    }), [width, height, panels, panelSpacing, timeRange, margins])

    return (
        <BaseCanvas
            width={width}
            height={height}
            draw={paint}
            drawData={drawData}
        />
    )
}

export default TSVMainLayer
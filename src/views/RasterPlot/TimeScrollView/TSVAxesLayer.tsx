import BaseCanvas from 'FigurlCanvas/BaseCanvas';
import React, { FunctionComponent, useMemo } from 'react';
import { paint } from './paint';
import { TimeScrollViewPanel } from './TimeScrollView';

type Props = {
    panels: TimeScrollViewPanel[]
    timeRange: [number, number]
    margins: {left: number, right: number, top: number, bottom: number}
    selectedPanelKeys: string[]
    panelSpacing: number
    width: number
    height: number
}

const TSVAxesLayer: FunctionComponent<Props> = ({width, height, panels, panelSpacing, timeRange, margins, selectedPanelKeys}) => {
    const drawData = useMemo(() => ({
        width, height, panels, panelSpacing, timeRange, margins, selectedPanelKeys,
        layer: 'axes' as 'axes' | 'main'
    }), [width, height, panels, panelSpacing, timeRange, margins, selectedPanelKeys])

    return (
        <BaseCanvas
            width={width}
            height={height}
            draw={paint}
            drawData={drawData}
        />
    )
}

export default TSVAxesLayer
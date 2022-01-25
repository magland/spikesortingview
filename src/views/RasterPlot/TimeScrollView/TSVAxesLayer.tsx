import BaseCanvas from 'FigurlCanvas/BaseCanvas';
import React, { useMemo } from 'react';
import { paintAxes } from './paint';
import { TimeScrollViewPanel, TimeTick } from './TimeScrollView';

export type TSVAxesLayerProps<T extends {[key: string]: any}> = {
    panels: TimeScrollViewPanel<T>[]
    timeRange: [number, number]
    timeTicks: TimeTick[]
    margins: {left: number, right: number, top: number, bottom: number}
    selectedPanelKeys: string[]
    panelHeight: number
    perPanelOffset: number
    hideTimeAxis?: boolean
    width: number
    height: number
}

const TSVAxesLayer = <T extends {[key: string]: any}>(props: TSVAxesLayerProps<T>) => {
    const {width, height, panels, panelHeight, perPanelOffset, timeRange, timeTicks, margins, selectedPanelKeys, hideTimeAxis} = props
    const drawData = useMemo(() => ({
        width, height, panels, panelHeight, perPanelOffset, timeRange, timeTicks, margins, selectedPanelKeys, hideTimeAxis
    }), [width, height, panels, panelHeight, perPanelOffset, timeRange, timeTicks, margins, selectedPanelKeys, hideTimeAxis])

    return (
        <BaseCanvas
            width={width}
            height={height}
            draw={paintAxes}
            drawData={drawData}
        />
    )
}

export default TSVAxesLayer
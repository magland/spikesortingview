import BaseCanvas from 'FigurlCanvas/BaseCanvas';
import React, { useMemo } from 'react';
import { paintPanels } from './paint';
import { TimeScrollViewPanel } from './TimeScrollView';

export type MainLayerProps<T extends {[key: string]: any}> = {
    panels: TimeScrollViewPanel<T>[]
    margins: {left: number, right: number, top: number, bottom: number}
    panelHeight: number
    perPanelOffset: number
    width: number
    height: number
}

const TSVMainLayer = <T extends {[key: string]: any}>(props: MainLayerProps<T>) => {
    const {width, height, panels, panelHeight, perPanelOffset, margins} = props
    const drawData = useMemo(() => ({
        width, height, panels, panelHeight, perPanelOffset, margins,
    }), [width, height, panels, panelHeight, perPanelOffset, margins])

    return (
        <BaseCanvas
            width={width}
            height={height}
            draw={paintPanels}
            drawData={drawData}
        />
    )
}

export default TSVMainLayer
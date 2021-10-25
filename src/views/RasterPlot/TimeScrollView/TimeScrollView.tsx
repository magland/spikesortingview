import React, { FunctionComponent, useMemo } from 'react';
import TSVAxesLayer from './TSVAxesLayer';
import TSVMainLayer from './TSVMainLayer';

export type TimeScrollViewPanel = {
    key: string,
    label: string,
    props: {[key: string]: any},
    paint: (context: CanvasRenderingContext2D, rect: {x: number, y: number, width: number, height: number}, timeRange: [number, number], props: any) =>  void
}

type Props = {
    startTimeSec: number
    endTimeSec: number
    panels: TimeScrollViewPanel[]
    panelSpacing: number
    selectedPanelKeys: string[]
    setSelectedPanelKeys: (keys: string[]) => void
    width: number
    height: number
}

const TimeScrollView: FunctionComponent<Props> = ({startTimeSec, endTimeSec, panels, panelSpacing, selectedPanelKeys, setSelectedPanelKeys, width, height}) => {
    const timeRange = useMemo(() => (
        [startTimeSec, endTimeSec] as [number, number]
    ), [startTimeSec, endTimeSec])
    const margins = useMemo(() => ({
        left: 30,
        right: 20,
        top: 20,
        bottom: 50
    }), [])
    return (
        <div style={{width, height, position: 'relative'}}>
            <TSVAxesLayer
                width={width}
                height={height}
                panels={panels}
                panelSpacing={panelSpacing}
                selectedPanelKeys={selectedPanelKeys}
                timeRange={timeRange}
                margins={margins}
            />
            <TSVMainLayer
                width={width}
                height={height}
                panels={panels}
                panelSpacing={panelSpacing}
                timeRange={timeRange}
                margins={margins}
            />
        </div>
    )
}

export default TimeScrollView
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
    width: number
    height: number
}

const TimeScrollView: FunctionComponent<Props> = ({startTimeSec, endTimeSec, panels, width, height}) => {
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
                timeRange={timeRange}
                margins={margins}
            />
            <TSVMainLayer
                width={width}
                height={height}
                panels={panels}
                timeRange={timeRange}
                margins={margins}
            />
        </div>
    )
}

export default TimeScrollView
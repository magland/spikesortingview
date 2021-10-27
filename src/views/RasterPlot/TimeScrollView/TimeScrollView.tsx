import React, { useCallback, useMemo } from 'react';
import TSVAxesLayer from './TSVAxesLayer';
import TSVMainLayer from './TSVMainLayer';

export type TimeScrollViewPanel<T extends {[key: string]: any}> = {
    key: string,
    label: string,
    props: T,
    paint: (context: CanvasRenderingContext2D, props: T) =>  void
}

type Margins = {
    left: number,
    right: number,
    top: number,
    bottom: number
}

export type TimeRangeAction = {
    type: 'ZoomIn'
} | {
    type: 'ZoomOut'
} | {
    type: 'Pan'
    timeOffset: number
}

type TimeScrollViewProps<T extends {[key: string]: any}> = {
    margins?: Margins
    panels: TimeScrollViewPanel<T>[]
    panelSpacing: number
    selectedPanelKeys: string[]
    setSelectedPanelKeys: (keys: string[]) => void
    width: number
    height: number
    timeRangeDispatch?: (a: TimeRangeAction) => void
}

const defaultMargins = {
    left: 30,
    right: 20,
    top: 20,
    bottom: 50
}

// Unfortunately, you can't nest generic type declarations here: so while this is properly a
// FunctionComponent<TimeScrollViewPanel<T>>, there just isn't a way to do that syntactically
// while still using arrow notation. (It *might* be possible with explicit function notation, but
// I haven't tried too hard.)
// I felt it was more important to stress that the props are of the same type that the paint function
// expects to consume, since the code will successfully infer that this is a FunctionComponent that
// takes a TimeScrollViewProps.
const TimeScrollView = <T extends {[key: string]: any}> (props: TimeScrollViewProps<T>) => {
    const {startTimeSec, endTimeSec, margins, panels, panelSpacing, selectedPanelKeys, width, height, timeRangeDispatch } = props
    const timeRange = useMemo(() => (
        [startTimeSec, endTimeSec] as [number, number]
    ), [startTimeSec, endTimeSec])
    const definedMargins = useMemo(() => margins || defaultMargins, [margins])
    const panelHeight = (height - definedMargins.top - definedMargins.bottom - panelSpacing * (panels.length - 1))/panels.length
    const perPanelOffset = panelHeight + panelSpacing
    const {visibleTimeRange, visibleTimeRangeDispatch} = useVisibleTimeRange()
    const handleWheel: React.WheelEventHandler<HTMLDivElement> = useCallback((event) => {
        if (!timeRangeDispatch) return
        const delta = event.deltaY
        if (delta < 0) {
            visibleTimeRangeDispatch({type: 'ZoomIn'})
        }
        else if (delta > 0) {
            visibleTimeRangeDispatch({type: 'ZoomOut'})
        }
        console.log('----', event, event.deltaX, event.deltaY, event.deltaZ)
    }, [])
    return (
        <div
            style={{width, height, position: 'relative'}}
            onWheel={handleWheel}
        >
            <TSVAxesLayer<T>
                width={width}
                height={height}
                panels={panels}
                panelHeight={panelHeight}
                perPanelOffset={perPanelOffset}
                selectedPanelKeys={selectedPanelKeys}
                timeRange={timeRange}
                margins={definedMargins}
            />
            <TSVMainLayer<T>
                width={width}
                height={height}
                panels={panels}
                panelHeight={panelHeight}
                perPanelOffset={perPanelOffset}
                margins={definedMargins}
            />
        </div>
    )
}

export default TimeScrollView
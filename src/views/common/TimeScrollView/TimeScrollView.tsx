import { useTimeRange } from 'libraries/RecordingSelectionContext';
import { Splitter } from 'libraries/Splitter';
import { useEffect, useMemo, useRef } from 'react';
import { use1dScalingMatrix } from 'util/pointProjection';
import { TimeseriesLayoutOpts } from 'View';
import { TickSet } from 'views/common/TimeScrollView/YAxisTicks';
import { DefaultToolbarWidth } from 'views/common/TimeWidgetToolbarEntries';
import { ViewToolbar } from 'libraries/ViewToolbar';
import { useTimeTicks } from './TimeAxisTicks';
import useActionToolbar, { OptionalToolbarActions } from './TimeScrollViewActionsToolbar';
import { HighlightIntervalSet } from './TimeScrollViewData';
import { Margins, useDefinedMargins, useFocusTimeInPixels, usePanelDimensions } from './TimeScrollViewDimensions';
import useTimeScrollEventHandlers, { suppressWheelScroll } from './TimeScrollViewInteractions/TimeScrollViewEventHandlers';
import useTimeScrollZoom from './TimeScrollViewInteractions/useTimeScrollZoom';
import { filterAndProjectHighlightSpans } from './TimeScrollViewSpans';
import TSVAxesLayer from './TSVAxesLayer';
import TSVCursorLayer from './TSVCursorLayer';
import TSVHighlightLayer from './TSVHighlightLayer';
import TSVMainLayer from './TSVMainLayer';


export type TimeScrollViewPanel<T extends {[key: string]: any}> = {
    key: string,
    label: string,
    props: T,
    paint: (context: CanvasRenderingContext2D, props: T) =>  void
}


type TimeScrollViewProps<T extends {[key: string]: any}> = {
    panels: TimeScrollViewPanel<T>[]
    panelSpacing: number
    margins?: Margins
    width: number
    height: number
    selectedPanelKeys?: Set<number | string>
    highlightSpans?: HighlightIntervalSet[]
    optionalActions?: OptionalToolbarActions
    timeseriesLayoutOpts?: TimeseriesLayoutOpts
    yTickSet?: TickSet
}

const emptyPanelSelection = new Set<number | string>()

// Unfortunately, you can't nest generic type declarations here: so while this is properly a
// FunctionComponent<TimeScrollViewPanel<T>>, there just isn't a way to do that syntactically
// while still using arrow notation. (It *might* be possible with explicit function notation, but
// I haven't tried too hard.)
// I felt it was more important to stress that the props are of the same type that the paint function
// expects to consume, since the code will successfully infer that this is a FunctionComponent that
// takes a TimeScrollViewProps.
const TimeScrollView = <T extends {[key: string]: any}> (props: TimeScrollViewProps<T>) => {
    const { margins, panels, panelSpacing, selectedPanelKeys, width, height, optionalActions, timeseriesLayoutOpts, highlightSpans, yTickSet } = props
    const { hideToolbar, hideTimeAxis } = timeseriesLayoutOpts || {}
    const divRef = useRef<HTMLDivElement | null>(null)
    
    const { visibleTimeStartSeconds, visibleTimeEndSeconds, zoomRecordingSelection } = useTimeRange()
    const timeRange = useMemo(() => (
        [visibleTimeStartSeconds, visibleTimeEndSeconds] as [number, number]
    ), [visibleTimeStartSeconds, visibleTimeEndSeconds])

    const definedMargins = useDefinedMargins(margins)
    const toolbarWidth = hideToolbar ? 0 : DefaultToolbarWidth
    const {panelHeight, panelWidth} = usePanelDimensions(width - toolbarWidth, height, panels.length, panelSpacing, definedMargins)
    const perPanelOffset = panelHeight + panelSpacing

    const timeToPixelMatrix = use1dScalingMatrix(panelWidth, visibleTimeStartSeconds, visibleTimeEndSeconds, definedMargins.left)
    const focusTimeInPixels = useFocusTimeInPixels(timeToPixelMatrix)

    const timeTicks = useTimeTicks(visibleTimeStartSeconds, visibleTimeEndSeconds, timeToPixelMatrix)

    const pixelHighlightSpans = filterAndProjectHighlightSpans(highlightSpans, visibleTimeStartSeconds, visibleTimeEndSeconds, timeToPixelMatrix)

    const timeControlActions = useActionToolbar(optionalActions ?? {})
    useEffect(() => suppressWheelScroll(divRef), [divRef])
    const handleWheel = useTimeScrollZoom(divRef, zoomRecordingSelection)
    const {handleMouseDown, handleMouseUp, handleMouseLeave, handleMouseMove} = useTimeScrollEventHandlers(definedMargins.left, panelWidth, divRef)

    // TODO: It'd be nice to show some sort of visual indication of how much zoom has been requested,

    const effectiveWidth = useMemo(() => width - toolbarWidth, [width, toolbarWidth])

    const style = useMemo(() => {
        return {width: effectiveWidth, height, position: 'relative'} as any as React.CSSProperties},
        [effectiveWidth, height])

    const axesLayer = useMemo(() => {
        return (
            <TSVAxesLayer<T>
                width={effectiveWidth}
                height={height}
                panels={panels}
                panelHeight={panelHeight}
                perPanelOffset={perPanelOffset}
                selectedPanelKeys={selectedPanelKeys || emptyPanelSelection}
                timeRange={timeRange}
                timeTicks={timeTicks}
                yTickSet={yTickSet}
                margins={definedMargins}
                hideTimeAxis={hideTimeAxis} 
            />)
    }, [effectiveWidth, height, panels, panelHeight, perPanelOffset, selectedPanelKeys,
        timeRange, timeTicks, yTickSet, definedMargins, hideTimeAxis])

    const mainLayer = useMemo(() => {
        return (
            <TSVMainLayer<T>
                width={effectiveWidth}
                height={height}
                panels={panels}
                panelHeight={panelHeight}
                perPanelOffset={perPanelOffset}
                margins={definedMargins}
            />
        )
    }, [effectiveWidth, height, panels, panelHeight, perPanelOffset, definedMargins])

    const highlightLayer = useMemo(() => {
        return (
            pixelHighlightSpans.length > 0
            ? <TSVHighlightLayer
                    width={effectiveWidth}
                    height={height}
                    highlightSpans={pixelHighlightSpans}
                    margins={definedMargins}
              />
            : <div />
        )
    }, [effectiveWidth, height, pixelHighlightSpans, definedMargins])

    const cursorLayer = useMemo(() => {
        return (
            <TSVCursorLayer
                width={effectiveWidth}
                height={height}
                timeRange={timeRange}
                margins={definedMargins}
                focusTimePixels={focusTimeInPixels}
            />
        )
    }, [effectiveWidth, height, timeRange, definedMargins, focusTimeInPixels])

    const content = useMemo(() => {
        return (
            <div
                style={style}
                onWheel={handleWheel}
                onMouseDown={handleMouseDown}
                onMouseUp={handleMouseUp}
                onMouseMove={handleMouseMove}
                onMouseOut={handleMouseLeave}
            >
                {axesLayer}
                {mainLayer}
                {highlightLayer}
                {cursorLayer}
            </div>
        )
    }, [style, handleWheel, handleMouseDown, handleMouseUp, handleMouseMove, handleMouseLeave,
        axesLayer, mainLayer, highlightLayer, cursorLayer])
    
    if (hideToolbar) {
        return (
            <div ref={divRef}>
                {content}
            </div>
        )
    }

    return (
        <Splitter
            ref={divRef}
            width={width}
            height={height}
            initialPosition={toolbarWidth}
            adjustable={false}
        >
            <ViewToolbar
                width={toolbarWidth}
                height={height}
                customActions={timeControlActions}
            />
            {content}
        </Splitter>
    )
}

export default TimeScrollView
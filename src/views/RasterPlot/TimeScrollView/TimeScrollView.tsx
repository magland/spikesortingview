import { defaultZoomScaleFactor, PanDirection, ZoomDirection } from 'contexts/RecordingSelectionContext';
import { abs, matrix } from 'mathjs';
import Splitter from 'MountainWorkspace/components/Splitter/Splitter';
import React, { useCallback, useEffect, useMemo, useRef } from 'react';
import TimeWidgetToolbarEntries, { DefaultToolbarWidth } from 'views/common/TimeWidgetToolbarEntries';
import { ToolbarItem } from 'views/common/Toolbars';
import ViewToolbar from 'views/common/ViewToolbar';
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

type TimeScrollViewProps<T extends {[key: string]: any}> = {
    startTimeSec: number
    endTimeSec: number
    margins?: Margins
    panels: TimeScrollViewPanel<T>[]
    panelSpacing: number
    selectedPanelKeys: string[]
    setSelectedPanelKeys: (keys: string[]) => void
    zoomRecordingSelection?: (direction: ZoomDirection, factor?: number) => void
    panRecordingSelection?: (direction: PanDirection, pct?: number) => void
    width: number
    height: number
}

const defaultMargins = {
    left: 30,
    right: 20,
    top: 20,
    bottom: 50
}

export const computePanelDimensions = (width: number, height: number, panelCount: number, panelSpacing: number, margins?: Margins) => {
    // compute the dimensions of each panel in the panel set.
    const definedMargins = margins ?? defaultMargins
    const panelWidth = width - definedMargins.left - definedMargins.right - DefaultToolbarWidth
    const panelHeight = (height - definedMargins.top - definedMargins.bottom - panelSpacing * (panelCount - 1)) / panelCount
    return {panelWidth, panelHeight}
}

export const computePixelsPerSecond = (panelWidth: number, startTimeSec: number, endTimeSec: number) => {
    return panelWidth / (endTimeSec - startTimeSec)
}

// Returns a 2 x 1 matrix (vector) which, when it right-multiplies an augmented vector of times,
// will return the pixel equivalents of those times.
// Upper element of vector is the pixels-per-second conversion factor, bottom element is the
// offset from the initial time of the range.
// This is set up as a right-multiplication because to allow mapping a set of times to
// individual augmented vectors [t, 1] -- producing an n x 2 matrix.
export const get1dTimeToPixelMatrixRight = (pixelsPerSecond: number, startTimeSec: number) => {
    return matrix([ [pixelsPerSecond], [startTimeSec * -pixelsPerSecond] ])
}

// This is the 1 x 2 matrix (vector) which can left-multiply an augmented vector of times
// to return the pixel equivalent.
// To use this one, you would take the time points in array `times` and then augment them by:
// const augmentedTimes = matrix([ times, new Array(times.length).fill(1) ])
// which gives a 2 x n matrix of augmented times; then the vector is the right shape afterward.
export const get1dTimeToPixelMatrix = (pixelsPerSecond: number, startTimeSec: number) => {
    return matrix([pixelsPerSecond, startTimeSec * -pixelsPerSecond])
}

// TODO: Will implement 2d transform matrices once we actually do something with them.


// Unfortunately, you can't nest generic type declarations here: so while this is properly a
// FunctionComponent<TimeScrollViewPanel<T>>, there just isn't a way to do that syntactically
// while still using arrow notation. (It *might* be possible with explicit function notation, but
// I haven't tried too hard.)
// I felt it was more important to stress that the props are of the same type that the paint function
// expects to consume, since the code will successfully infer that this is a FunctionComponent that
// takes a TimeScrollViewProps.
const TimeScrollView = <T extends {[key: string]: any}> (props: TimeScrollViewProps<T>) => {
    const {startTimeSec, endTimeSec, margins, panels, panelSpacing, selectedPanelKeys, zoomRecordingSelection, panRecordingSelection, width, height } = props
    const divRef = useRef<HTMLDivElement | null>(null)
    const timeRange = useMemo(() => (
        [startTimeSec, endTimeSec] as [number, number]
    ), [startTimeSec, endTimeSec])
    const definedMargins = useMemo(() => margins || defaultMargins, [margins])
    const {panelHeight} = useMemo(() => computePanelDimensions(width, height, panels.length, panelSpacing, definedMargins),
        [width, height, panels.length, panelSpacing, definedMargins])
    const perPanelOffset = panelHeight + panelSpacing

    const timeControlActions = useMemo(() => {
        if (!zoomRecordingSelection || !panRecordingSelection) return []
        const timeControls = TimeWidgetToolbarEntries({zoomRecordingSelection, panRecordingSelection})
        const actions: ToolbarItem[] = [
            // This is the skeleton for where we'd fit any other controls around the time controls
            ...timeControls
        ]
        return actions
    }, [zoomRecordingSelection, panRecordingSelection])

    const zoomsCount = useRef(0)
    const zoomsPending = useRef(false)

    useEffect(() => {
        if (!divRef.current) return
        const canvases = Array.from(divRef.current.children).filter(e => e.nodeName === 'CANVAS')
        canvases.forEach(c => {
            c.addEventListener('wheel', (e: Event) => {
                if ((divRef?.current as any)['_hasFocus']) {
                    e.preventDefault()
                }
            })
        })
    }, [divRef])

    // This is the non-debounced version of zooming
    // const handleWheel = useCallback((e: React.WheelEvent) => {
    //     if (!(divRef?.current as any)['_hasFocus']) return
    //     const direction = e.deltaY < 0 ? 'in' : 'out'
    //     zoomRecordingSelection && zoomRecordingSelection(direction)
    //     return false
    // }, [zoomRecordingSelection])

    // TODO: It'd be nice to show some sort of visual indication of how much zoom has been requested,
    // one that's cheap to update (so redraws immediately).
    const resolveZooms = useCallback(() => {
        if (!zoomsCount.current || zoomsCount.current === 0) return
        const direction = zoomsCount.current > 0 ? 'in' : 'out'
        const factor = defaultZoomScaleFactor ** abs(zoomsCount.current)
        // console.log(`Applying ${zoomsCount.current} operations leads to factor ${factor}`)
        zoomRecordingSelection && zoomRecordingSelection(direction, factor)
        zoomsPending.current = false
        zoomsCount.current = 0
    }, [zoomRecordingSelection])

    const handleWheel = useCallback((e: React.WheelEvent) => {
        if (!(divRef?.current as any)['_hasFocus']) return
        zoomsCount.current += e.deltaY < 0 ? 1 : -1
        if (!zoomsPending.current) {
            // console.log('No zoom scheduled, scheduling one')
            setTimeout(resolveZooms, 300)
            zoomsPending.current = true
        } /*else {
            console.log(`Updated scheduled zoom amount to ${zoomsCount.current}.`)
        }*/
        return false
    }, [resolveZooms])

    const handleClick = (e: React.MouseEvent) => {
        if (!divRef || !divRef.current || divRef.current === null) {
            console.log(`divref is null.`)
            return
        }
        (divRef?.current as any)['_hasFocus'] = true
    }
    const handleMouseLeave = (e: React.MouseEvent) => {
        if (!divRef || !divRef.current || divRef.current === null) {
            console.log(`divref is null.`)
            return
        }
        (divRef?.current as any)['_hasFocus'] = false
    }

    // return (
    //     <div
    //         ref={divRef}
    //         style={{width: width - DefaultToolbarWidth, height, position: 'relative'}}
    //         onWheel={handleWheel}
    //         onClick={handleClick}
    //         onMouseOut={handleMouseLeave}
    //     >
    //         <TSVAxesLayer<T>
    //             width={width - DefaultToolbarWidth}
    //             height={height}
    //             panels={panels}
    //             panelHeight={panelHeight}
    //             perPanelOffset={perPanelOffset}
    //             selectedPanelKeys={selectedPanelKeys}
    //             timeRange={timeRange}
    //             margins={definedMargins}
    //         />
    //         <TSVMainLayer<T>
    //             width={width - DefaultToolbarWidth}
    //             height={height}
    //             panels={panels}
    //             panelHeight={panelHeight}
    //             perPanelOffset={perPanelOffset}
    //             margins={definedMargins}
    //         />
    //     </div>
    // )

    return (
        <Splitter
            ref={divRef}
            width={width}
            height={height}
            initialPosition={DefaultToolbarWidth}
            adjustable={false}
        >
            <ViewToolbar
                width={DefaultToolbarWidth}
                height={height}
                customActions={timeControlActions}
            />
            <div
                style={{width: width - DefaultToolbarWidth, height, position: 'relative'}}
                onWheel={handleWheel}
                onClick={handleClick}
                onMouseOut={handleMouseLeave}
            >
                <TSVAxesLayer<T>
                    width={width - DefaultToolbarWidth}
                    height={height}
                    panels={panels}
                    panelHeight={panelHeight}
                    perPanelOffset={perPanelOffset}
                    selectedPanelKeys={selectedPanelKeys}
                    timeRange={timeRange}
                    margins={definedMargins}
                />
                <TSVMainLayer<T>
                    width={width - DefaultToolbarWidth}
                    height={height}
                    panels={panels}
                    panelHeight={panelHeight}
                    perPanelOffset={perPanelOffset}
                    margins={definedMargins}
                />
            </div>
        </Splitter>
    )
}

export default TimeScrollView
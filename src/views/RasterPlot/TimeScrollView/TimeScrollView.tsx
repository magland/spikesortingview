import { defaultZoomScaleFactor, useTimeFocus, useTimeRange } from 'contexts/RecordingSelectionContext';
import { abs, matrix, Matrix, multiply } from 'mathjs';
import Splitter from 'MountainWorkspace/components/Splitter/Splitter';
import React, { useCallback, useEffect, useMemo, useRef } from 'react';
import TimeWidgetToolbarEntries, { DefaultToolbarWidth } from 'views/common/TimeWidgetToolbarEntries';
import { Divider, ToolbarItem } from 'views/common/Toolbars';
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
    margins?: Margins
    panels: TimeScrollViewPanel<T>[]
    panelSpacing: number
    selectedPanelKeys: string[]
    setSelectedPanelKeys: (keys: string[]) => void
    optionalActionsAboveDefault?: ToolbarItem[]
    optionalActionsBelowDefault?: ToolbarItem[]
    width: number
    height: number
}

const defaultMargins = {
    left: 30,
    right: 20,
    top: 20,
    bottom: 50
}

export const usePanelDimensions = (width: number, height: number, panelCount: number, panelSpacing: number, margins?: Margins) => {
    return useMemo(() => {
        const definedMargins = margins ?? defaultMargins
        const panelWidth = width - definedMargins.left - definedMargins.right - DefaultToolbarWidth
        const panelHeight = (height - definedMargins.top - definedMargins.bottom - panelSpacing * (panelCount - 1)) / panelCount
        return {panelWidth, panelHeight}
    }, [width, height, panelCount, panelSpacing, margins])
}

export const usePixelsPerSecond = (panelWidth: number, startTimeSec: number | false, endTimeSec: number | false) => {
    return useMemo(() => {
        if (startTimeSec === false || endTimeSec === false || startTimeSec === endTimeSec) {
            console.warn('Attempting to compute pixels-per-second with unset times or zero denominator. Returning default of 1.')
            return 1
        }
        return panelWidth / (endTimeSec - startTimeSec)
    }, [panelWidth, startTimeSec, endTimeSec])
}


/* Scaling matrix computations */

// Returns a 2 x 1 matrix (vector) which, when it right-multiplies an augmented vector of times,
// will return the pixel equivalents of those times.
// Upper element of vector is the pixels-per-second conversion factor, bottom element is the
// offset from the initial time of the range.
// This is set up as a right-multiplication because to allow mapping a set of times to
// individual augmented vectors [t, 1] -- producing an n x 2 matrix.
export const use1dTimeToPixelMatrixRight = (pixelsPerSecond: number, startTimeSec: number | false, extraPixelOffset: number = 0) => {
    return useMemo(() => {
        if (startTimeSec === false) {
            console.warn('Attempt to compute time transform with unset start time. Mapping to null.')
            return matrix([[0], [0]])
        }
        return matrix([ [pixelsPerSecond], [extraPixelOffset + startTimeSec * -pixelsPerSecond] ])
    }, [pixelsPerSecond, startTimeSec, extraPixelOffset])
}

// This is the 1 x 2 matrix (vector) which can left-multiply an augmented vector of times
// to return the pixel equivalent.
// To use this one, you would take the time points in array `times` and then augment them by:
// const augmentedTimes = matrix([ times, new Array(times.length).fill(1) ])
// which gives a 2 x n matrix of augmented times; then the vector is the right shape afterward.
export const use1dTimeToPixelMatrix = (pixelsPerSecond: number, startTimeSec: number | false, extraPixelOffset: number = 0) => {
    return useMemo(() => {
        if (startTimeSec === false) {
            console.warn('Attempt to compute time transform with unset start time. Mapping to null.')
            return matrix([0, 0])
        }
        return matrix([pixelsPerSecond, extraPixelOffset + startTimeSec * -pixelsPerSecond])
    }, [pixelsPerSecond, startTimeSec, extraPixelOffset])
}

export const use2dPanelDataToPixelMatrix = (pixelsPerSecond: number, startTimeSec: number | false, dataMin: number, dataMax: number, userScaleFactor: number, panelHeight: number, invertY?: boolean) => {
    return useMemo(() => {
        if (startTimeSec === false) {
            console.warn('Attmept to compute time panel transform with unset start time. Mapping to null.')
            return matrix([[0, 0, 0], [0, 0, 0,]])
        }
        if (dataMax === dataMin) {
            console.warn('Attempt to compute time panel transform with 0-width data range. Mapping to null.')
            return matrix([[0, 0, 0], [0, 0, 0]])
        }
        // a non-inverted scaling would look like:
        //      [1]   y --> (((y * userScaleFactor) - y_min) / (y_max - y_min)) * panelHeight
        // which places y proportionally in the panel to where it falls in the data.
        // Inverting that scaling would mean subtracting the variable part from 1:
        //      [2]   y --> (1 - ((y * userScaleFactor) - y_min) / (y_max - y_min)) * panelHeight
        // But we don't want to have to do the subtraction and rescale everything every time.
        // Instead, let's rewrite [1] as:
        //      [1']  y --> ((y * userScaleFactor) / (y_max - y_min) - (y_min / (y_max - y_min)) * panelHeight
        // That will be less hairy if we let yScale = (panelHeight) / (y_max - y_min), then:
        //
        //      [1f] y --> ( y * yScale * userScaleFactor) - (y_min * yScale)
        //
        // which gives us an input, a scale, and an offset.
        // For the inverted case, rewrite [2] as:
        //      [2']  y --> (1                 - ((y * userScaleFactor)/y_range) + (y_min/y_range)) * panelHeight
        // Distribute the panelHeight:
        //      [2"]  y --> (panelHeight      - (panelHeight * y * usf)/y_range) + (panelHeight * y_min)/y_range)
        // Again, use yScale = (panelHeight) / y_range:
        //      [2"'] y --> (yScale * y_range) - (yScale  * y * userScaleFactor) + (yScale * y_min)
        // and as a scale and offset version:
        //
        //      [2f]  y --> (-yScale * y * userScaleFactor) + (yScale * (y_range + y_min))
        // (and observe that since y_range = y_max - y_min, then y_range + y_min = y_max.)

        const yRange = (dataMax - dataMin)
        const yScale = (panelHeight) / (yRange)
        const yOffset = invertY ?  yScale * dataMax
                                : -yScale * dataMin
        const finalYScale = userScaleFactor * (invertY ? -yScale : yScale)
        
        // 2d transform matrices that we use are always of the form:
        // x-scale,    0,     x-offset,
        //     0,   y-scale,  y-offset
        // (We don't actually need a third row)
        return matrix([[pixelsPerSecond,         0    ,   startTimeSec * -pixelsPerSecond],
                       [        0      ,   finalYScale,           yOffset                ]])
        
    }, [pixelsPerSecond, startTimeSec, dataMin, dataMax, userScaleFactor, panelHeight, invertY])
}

/* Time-axis Tick computations */

export type TimeTick = {
    value: number
    label: string
    major: boolean
    pixelXposition: number
}

type TickUnit = {
    name: string,
    secondsPerTick: number,
    countPerLargerUnit: number,
    scale_appropriate_label: (a: number) => string
}

const tickUnits: TickUnit[] = [
    {
        name: '1ms',
        secondsPerTick: 0.001,
        countPerLargerUnit: 10,
        scale_appropriate_label: (a: number) => (`${a % 1000} ms`)
    },
    {
        name: '10ms',
        secondsPerTick: 0.01,
        countPerLargerUnit: 10,
        scale_appropriate_label: (a: number) => (`${(a * 10) % 1000} ms`)
    },
    {
        name: '100ms',
        secondsPerTick: 0.1,
        countPerLargerUnit: 10,
        scale_appropriate_label: (a: number) => (`${(a * 100) % 1000} ms`)
    },
    {
        name: '1s',
        secondsPerTick: 1,
        countPerLargerUnit: 10,
        scale_appropriate_label: (a: number) => (`${a % 60} s`)
    },
    {
        name: '10s',
        secondsPerTick: 10,
        countPerLargerUnit: 6,
        scale_appropriate_label: (a: number) => (`${(a * 10) % 60} s`)
    },
    {
        name: '1min',
        secondsPerTick: 60,
        countPerLargerUnit: 10,
        scale_appropriate_label: (a: number) => (`${a % 60} min`)
    },
    {
        name: '10min',
        secondsPerTick: 60 * 10,
        countPerLargerUnit: 6,
        scale_appropriate_label: (a: number) => (`${(a * 10) % 60} min`)
    },
    {
        name: '1hr',
        secondsPerTick: 60 * 60,
        countPerLargerUnit: 6,
        scale_appropriate_label: (a: number) => (`${a % 24} hr`)
    },
    {
        name: '6hr',
        secondsPerTick: 60 * 60 * 6,
        countPerLargerUnit: 4,
        scale_appropriate_label: (a: number) => (`${(a * 6) % 24} hr`)
    },
    {
        name: '1day',
        secondsPerTick: 60 * 60 * 24,
        countPerLargerUnit: 10,
        scale_appropriate_label: (a: number) => (`${a} day`)
    },
    {
        name: '10day',
        secondsPerTick: 60 * 60 * 24 * 10,
        countPerLargerUnit: 10000,
        scale_appropriate_label: (a: number) => (`${10 * a} day`)
    }
]

const useTimeTicks = (startTimeSec: number | false, endTimeSec: number | false, timeToPixelMatrix: Matrix, pixelsPerSecond: number) => {
    return useMemo(() => {
        if (startTimeSec === false || endTimeSec === false) return []
        const ret: any[] = []
        // iterate over the defined tick scales and populate individual ticks of the appropriate scale.
        for (let u of tickUnits) {
            // pixels/second * seconds/tick = pixels/tick
            const pixelsPerTick = pixelsPerSecond * u.secondsPerTick
            if (pixelsPerTick <= 50) continue // ignore scales which would have too many ticks

            const firstTickInRange = Math.ceil(startTimeSec / u.secondsPerTick)
            const lastTickInRange = Math.floor(endTimeSec / u.secondsPerTick)
            // A tick scale is major if it passes a minimum width or if there's fewer than 5 ticks at that scale.
            const major = (pixelsPerTick > 200) || ((lastTickInRange - firstTickInRange) < 5)

            for (let tickNumber = firstTickInRange; tickNumber <= lastTickInRange; tickNumber++) {
                // skip ticks which would be represented by the next-larger scale
                if ((tickNumber % u.countPerLargerUnit) === 0) continue

                // const frac = ((tickNumber * u.duration_sec) - timeRange[0]) / (timeRange[1] - timeRange[0])
                // const pixelX = leftMargin + panelWidth * frac
                ret.push({
                    value: tickNumber * u.secondsPerTick,
                    label: u.scale_appropriate_label(tickNumber),
                    major,
                })
            }
        }
        const augmentedTimes = matrix([ret.map(tick => tick.value), new Array(ret.length).fill(1) ])
        const tickPositions = multiply(timeToPixelMatrix, augmentedTimes).valueOf() as number[]
        tickPositions.forEach((t, i) => ret[i].pixelXposition = t)
        return ret as TimeTick[]
    }, [startTimeSec, endTimeSec, timeToPixelMatrix, pixelsPerSecond])
}


// Unfortunately, you can't nest generic type declarations here: so while this is properly a
// FunctionComponent<TimeScrollViewPanel<T>>, there just isn't a way to do that syntactically
// while still using arrow notation. (It *might* be possible with explicit function notation, but
// I haven't tried too hard.)
// I felt it was more important to stress that the props are of the same type that the paint function
// expects to consume, since the code will successfully infer that this is a FunctionComponent that
// takes a TimeScrollViewProps.
const TimeScrollView = <T extends {[key: string]: any}> (props: TimeScrollViewProps<T>) => {
    const { margins, panels, panelSpacing, selectedPanelKeys, width, height, optionalActionsAboveDefault, optionalActionsBelowDefault } = props
    const { visibleTimeStartSeconds, visibleTimeEndSeconds, zoomRecordingSelection, panRecordingSelection, panRecordingSelectionDeltaT } = useTimeRange()
    const { focusTime, setTimeFocusFraction, timeForFraction } = useTimeFocus()
    const divRef = useRef<HTMLDivElement | null>(null)
    const timeRange = useMemo(() => (
        [visibleTimeStartSeconds, visibleTimeEndSeconds] as [number, number]
    ), [visibleTimeStartSeconds, visibleTimeEndSeconds])
    const definedMargins = useMemo(() => margins || defaultMargins, [margins])
    const {panelHeight, panelWidth} = usePanelDimensions(width, height, panels.length, panelSpacing, definedMargins)
    const perPanelOffset = panelHeight + panelSpacing

    const pixelsPerSecond = usePixelsPerSecond(panelWidth, visibleTimeStartSeconds, visibleTimeEndSeconds)
    const focusTimeInPixels = useMemo(() => {
        if (focusTime === undefined) return undefined
        if (visibleTimeStartSeconds === false) return undefined
        return pixelsPerSecond * (focusTime - visibleTimeStartSeconds) + definedMargins.left
    }, [focusTime, visibleTimeStartSeconds, pixelsPerSecond, definedMargins.left])

    const timeToPixelMatrix = use1dTimeToPixelMatrix(pixelsPerSecond, visibleTimeStartSeconds, definedMargins.left)
    const timeTicks = useTimeTicks(visibleTimeStartSeconds, visibleTimeEndSeconds, timeToPixelMatrix, pixelsPerSecond)

    const timeControlActions = useMemo(() => {
        if (!zoomRecordingSelection || !panRecordingSelection) return []
        const preToolbarEntries = optionalActionsAboveDefault ? [...optionalActionsAboveDefault, Divider] : []
        const postToolbarEntries = optionalActionsBelowDefault ? [Divider, ...optionalActionsBelowDefault] : []
        const timeControls = TimeWidgetToolbarEntries({zoomRecordingSelection, panRecordingSelection})
        const actions: ToolbarItem[] = [
            ...preToolbarEntries,
            ...timeControls,
            ...postToolbarEntries
        ]
        return actions
    }, [zoomRecordingSelection, panRecordingSelection, optionalActionsAboveDefault, optionalActionsBelowDefault])

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
        const factor = defaultZoomScaleFactor ** abs(zoomsCount.current) // note that zoomsCount.current will be fractional
        zoomRecordingSelection && zoomRecordingSelection(direction, factor)
        zoomsPending.current = false
        zoomsCount.current = 0
    }, [zoomRecordingSelection])

    const handleWheel = useCallback((e: React.WheelEvent) => {
        if (!(divRef?.current as any)['_hasFocus']) return
        // zoomsCount.current += e.deltaY < 0 ? 1 : -1
        // use continuous zoom count so that it works nicely with countinuous as well as discrete mouse wheel. For example, trackpad is continuous wheel.
        zoomsCount.current += -e.deltaY / 100
        if (!zoomsPending.current) {
            setTimeout(resolveZooms, 50)
            zoomsPending.current = true
        }
        return false
    }, [resolveZooms])

    const handleClick = useCallback((e: React.MouseEvent) => {
        if (!divRef || !divRef.current || divRef.current === null) {
            return
        }
        const clickX = e.clientX - e.currentTarget.getBoundingClientRect().x - definedMargins.left
        // Constrain fraction to be in the range (0, 1) -- the clickable range is greater than the
        // actual display/drawing area of the panels.
        const frac = Math.max(0, Math.min(1, clickX / panelWidth))
        setTimeFocusFraction(frac)
        
        ;(divRef?.current as any)['_hasFocus'] = true
    }, [definedMargins.left, panelWidth, setTimeFocusFraction])

    const panState = useRef<{
        anchorTime?: number,
        anchorX?: number,
        panning?: boolean
        pannedTime?: number
        pannedX?: number
        panPending?: boolean
    }>({})

    const handleMouseDown = useCallback((e: React.MouseEvent) => {
        if (!divRef || !divRef.current || divRef.current === null) {
            return
        }
        const clickX = e.clientX - e.currentTarget.getBoundingClientRect().x - definedMargins.left
        const frac = Math.max(0, Math.min(1, clickX / panelWidth))
        panState.current.anchorTime = timeForFraction(frac)
        panState.current.anchorX = clickX
        panState.current.panning = false
        panState.current.pannedX = undefined
    }, [panelWidth, definedMargins, timeForFraction])

    const handleMouseUp = useCallback((e: React.MouseEvent) => {
        if (!divRef || !divRef.current || divRef.current === null) {
            return
        }
        if (!panState.current.panning) {
            handleClick(e)
        }
        panState.current = {}
    }, [handleClick])

    const resolvePanning = useCallback(() => {
        if (!panState.current.panPending) return
        panState.current.panPending = false
        // what we want is for pannedX to correspond to anchorTime
        // but pannedX corresponds to pannedTime
        // so we need to translate time by anchorTime - pannedTime
        const deltaT = (panState.current.anchorTime || 0) - (panState.current.pannedTime || 0)
        panRecordingSelectionDeltaT(deltaT)
    }, [panRecordingSelectionDeltaT])

    const handleMouseMove = useCallback((e: React.MouseEvent) => {
        if (!divRef || !divRef.current || divRef.current === null) {
            return
        }
        const x = e.clientX - e.currentTarget.getBoundingClientRect().x - definedMargins.left
        const frac = Math.max(0, Math.min(1, x / panelWidth))
        if (panState.current.anchorX) {
            const deltaX = x - panState.current.anchorX
            if (Math.abs(deltaX) > 5) {
                panState.current.panning = true
            }
        }
        if (panState.current.panning) {
            panState.current.pannedTime = timeForFraction(frac)
            panState.current.pannedX = x
            panState.current.panPending = true
            setTimeout(() => {
                resolvePanning()
            }, 50)
        }
    }, [timeForFraction, definedMargins, panelWidth, resolvePanning])

    const handleMouseLeave = (e: React.MouseEvent) => {
        if (!divRef || !divRef.current || divRef.current === null) {
            return
        }
        panState.current = {}
        ;(divRef?.current as any)['_hasFocus'] = false
    }

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
                // onClick={handleClick}
                onMouseDown={handleMouseDown}
                onMouseUp={handleMouseUp}
                onMouseMove={handleMouseMove}
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
                    timeTicks={timeTicks}
                    margins={definedMargins}
                    focusTimePixels={focusTimeInPixels}
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
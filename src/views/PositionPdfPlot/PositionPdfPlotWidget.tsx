import { Checkbox } from '@material-ui/core'
import { useRecordingSelectionTimeInitialization, useTimeRange } from 'contexts/RecordingSelectionContext'
import { FunctionComponent, useCallback, useMemo, useState } from 'react'
import { convert1dDataSeries, use1dScalingMatrix } from 'util/pointProjection'
import { TimeseriesLayoutOpts } from 'View'
import TimeScrollView, { TimeScrollViewPanel } from 'views/common/TimeScrollView/TimeScrollView'
import { usePanelDimensions, useTimeseriesMargins } from 'views/common/TimeScrollView/TimeScrollViewDimensions'
import { DefaultToolbarWidth } from 'views/common/TimeWidgetToolbarEntries'
import useFetchCache from './useFetchCache'

export type FetchSegmentQuery = {
    type: 'fetchSegment'
    segmentNumber: number
    segmentSize: number
    downsampleFactor: number
}

type Props = {
    fetchSegment: (query: FetchSegmentQuery) => Promise<number[][]>
    startTimeSec: number
    endTimeSec: number
    samplingFrequency: number
    numPositions: number
    linearPositions?: number[]
    segmentSize: number
    multiscaleFactor: number
    timeseriesLayoutOpts?: TimeseriesLayoutOpts
    width: number
    height: number
}

type PanelProps = {
}

const panelSpacing = 4

const usePositionPdfDataModel = (fetchSegment: (q: FetchSegmentQuery) => Promise<number[][]>, numTimepoints: number, numPositions: number, segmentSize: number, multiscaleFactor: number) => {
    const fetchSegmentCache = useFetchCache<FetchSegmentQuery, number[][]>(fetchSegment)
    const get = useCallback((i1: number, i2: number, downsampleFactor: number) => {
        const s1 = Math.floor(i1 / segmentSize)
        const s2 = Math.ceil(i2 / segmentSize)
        const ret = allocate2d(i2 - i1, numPositions, undefined)
        for (let s = s1; s < s2; s++) {
            const S = fetchSegmentCache.get({type: 'fetchSegment', segmentNumber: s, segmentSize, downsampleFactor})
            if (S) {
                for (let i = 0; i < S.length; i++) {
                    const j = s * segmentSize - i1 + i
                    if ((0 <= j) && (j < i2 - i1)) {
                        for (let p = 0; p < numPositions; p++) {
                            ret[j][p] = S[i][p]
                        }
                    }
                }
            }
        }
        return ret
    }, [fetchSegmentCache, numPositions, segmentSize])
    return {
        get,
        numTimepoints,
        numPositions,
        segmentSize,
        multiscaleFactor
    }
}

const emptyPanelSelection = new Set<number | string>()

const PositionPdfPlotWidget: FunctionComponent<Props> = ({fetchSegment, startTimeSec, endTimeSec, samplingFrequency, numPositions, linearPositions, segmentSize, multiscaleFactor, timeseriesLayoutOpts, width, height}) => {
    useRecordingSelectionTimeInitialization(startTimeSec, endTimeSec)
    const { visibleTimeStartSeconds, visibleTimeEndSeconds } = useTimeRange()
    const numTimepoints = Math.floor((endTimeSec - startTimeSec) * samplingFrequency)
    const dataModel = usePositionPdfDataModel(fetchSegment, numTimepoints, numPositions, segmentSize, multiscaleFactor)
    const [showLinearPositionsOverlay, setShowLinearPositionsOverlay] = useState<boolean>(false)

    const {downsampleFactor, i1, i2} = useMemo(() => {
        if (visibleTimeStartSeconds === undefined) return {downsampleFactor: 1, i1: 0, i2: 0}
        if (visibleTimeEndSeconds === undefined) return {downsampleFactor: 1, i1: 0, i2: 0}
        const i1 = Math.max(0, Math.floor((visibleTimeStartSeconds - startTimeSec) * samplingFrequency))
        const i2 = Math.min(dataModel.numTimepoints, Math.ceil((visibleTimeEndSeconds - startTimeSec) * samplingFrequency))
        let downsampleFactor: number = 1
        while ((i2 - i1) / (downsampleFactor * dataModel.multiscaleFactor) > width) {
            downsampleFactor *= dataModel.multiscaleFactor
        }
        return {downsampleFactor, i1, i2}
    }, [dataModel, samplingFrequency, startTimeSec, visibleTimeStartSeconds, visibleTimeEndSeconds, width])

    const {visibleValues, t1, t2} = useMemo(() => {
        if (visibleTimeStartSeconds === undefined) return {visibleValues: undefined, t1: 0, t2: 0}
        if (visibleTimeEndSeconds === undefined) return {visibleValues: undefined, t1: 0, t2: 0}
        
        if (i2 <= i1) return {visibleValues: undefined, t1: 0, t2: 0}
        
        const j1 = Math.floor(i1 / downsampleFactor)
        const j2 = Math.ceil(i2 / downsampleFactor)
        const visibleValues = dataModel.get(j1, j2, downsampleFactor)
        const t1 = startTimeSec + j1 * downsampleFactor / samplingFrequency
        const t2 = startTimeSec + j2 * downsampleFactor / samplingFrequency
        return {visibleValues, t1, t2}
    }, [dataModel, visibleTimeStartSeconds, visibleTimeEndSeconds, startTimeSec, samplingFrequency, downsampleFactor, i1, i2])

    const visibleLinearPositions: number[] | undefined = useMemo(() => {
        if (!linearPositions) return undefined
        if (visibleTimeStartSeconds === undefined) return undefined
        if (visibleTimeEndSeconds === undefined) return undefined
        const i1 = Math.max(0, Math.floor((visibleTimeStartSeconds - startTimeSec) * samplingFrequency))
        const i2 = Math.min(dataModel.numTimepoints, Math.ceil((visibleTimeEndSeconds - startTimeSec) * samplingFrequency))
        return linearPositions.slice(i1, i2)
    }, [dataModel.numTimepoints, linearPositions, samplingFrequency, startTimeSec, visibleTimeStartSeconds, visibleTimeEndSeconds])

    const margins = useTimeseriesMargins(timeseriesLayoutOpts)

    const panelCount = 1
    const toolbarWidth = timeseriesLayoutOpts?.hideToolbar ? 0 : DefaultToolbarWidth
    const { panelWidth, panelHeight } = usePanelDimensions(width - toolbarWidth, height, panelCount, panelSpacing, margins)
    const timeToPixelMatrix = use1dScalingMatrix(panelWidth, visibleTimeStartSeconds, visibleTimeEndSeconds, margins.left)

    const pixelTimes = useMemo(() => {
        return convert1dDataSeries([t1, t2], timeToPixelMatrix)
    }, [t1, t2, timeToPixelMatrix])

    const {minValue, maxValue} = useMemo(() => {
        if (!visibleValues) return {minValue: 0, maxValue: 0}
        return {
            minValue: min(visibleValues.map(a => (min(a)))),
            maxValue: max(visibleValues.map(a => (max(a)))),
        }
    }, [visibleValues])

    const imageData = useMemo(() => {
        if (!visibleValues) return undefined
        if (minValue === undefined) return undefined
        if (maxValue === undefined) return undefined
        const N1 = visibleValues.length
        const N2 = visibleValues[0].length
        const imageData = new ImageData(N1, N2)
        let i = 0
        for (let i2=0; i2<N2; i2++) {
            for (let i1=0; i1<N1; i1++) {
                const vv = visibleValues[i1][N2 - 1 - i2]
                if (vv !== undefined) {
                    const v = (vv - minValue) / (maxValue - minValue)
                    const col = colorForValue(v)
                    imageData.data[i + 0] = col[0]
                    imageData.data[i + 1] = col[1]
                    imageData.data[i + 2] = col[2]
                    imageData.data[i + 3] = 255
                }
                else {
                    imageData.data[i + 0] = 0
                    imageData.data[i + 1] = 0
                    imageData.data[i + 2] = 0
                    imageData.data[i + 3] = 0
                }
                i += 4
            }
        }
        return imageData
    }, [visibleValues, minValue, maxValue])

    const paintPanel = useCallback((context: CanvasRenderingContext2D, props: PanelProps) => {
        if (!imageData) return
        // Draw scaled version of image
        // See: https://stackoverflow.com/questions/3448347/how-to-scale-an-imagedata-in-html-canvas
        const canvas = document.createElement('canvas')
        canvas.width = imageData.width
        canvas.height = imageData.height
        const c = canvas.getContext('2d')
        if (!c) return
        c.putImageData(imageData, 0, 0)
        if ((showLinearPositionsOverlay) && (visibleLinearPositions)) {
            c.fillStyle = 'white'
            c.strokeStyle = 'white'
            for (let i = 0; i < visibleLinearPositions.length; i++) {
                const xx = i / downsampleFactor
                const yy = imageData.height - 1 - visibleLinearPositions[i]
                c.fillRect(xx - 0.5, yy + 0.5, 1, 1)
            }
        }
        context.save()
        context.scale((pixelTimes[1] - pixelTimes[0]) / imageData.width, panelHeight / imageData.height)
        context.drawImage(canvas, pixelTimes[0], 0)
        context.restore()
    }, [pixelTimes, panelHeight, imageData, visibleLinearPositions, showLinearPositionsOverlay, downsampleFactor])

    const panels: TimeScrollViewPanel<PanelProps>[] = useMemo(() => {
        return [{
            key: `pdf`,
            label: ``,
            props: {} as PanelProps,
            paint: paintPanel
        }]
    }, [paintPanel])
    
    const height2 = linearPositions ? height - 50 : height
    return (
        <div>
            <TimeScrollView
                margins={margins}
                panels={panels}
                panelSpacing={panelSpacing}
                selectedPanelKeys={emptyPanelSelection}
                timeseriesLayoutOpts={timeseriesLayoutOpts}
                width={width}
                height={height2}
            />
            {
                linearPositions && (
                    <span>
                        <Checkbox checked={showLinearPositionsOverlay} onClick={() => {setShowLinearPositionsOverlay(a => (!a))}} />
                        Show actual position overlay
                    </span>
                )
            }
        </div>
    )
}

export const allocate2d = (N1: number, N2: number, value: number | undefined) => {
    const ret: (number | undefined)[][] = []
    for (let i1 = 0; i1 < N1; i1++) {
        ret.push(allocate1d(N2, value))
    }
    return ret
}

export const allocate1d = (N: number, value: number | undefined) => {
    const ret: (number | undefined)[] = []
    for (let i = 0; i < N; i++) ret.push(value)
    return ret
}

const colorForValue = (v: number) => {
    const a = Math.max(0, Math.min(255, Math.floor(v * 255) * 3))
    return [a, a, 60]
}

const min = (a: (number | undefined)[]) => {
    return a.filter(x => (x !== undefined)).reduce((prev, current) => ((prev as number) < (current as number)) ? prev : current, a[0] || 0)
}

const max = (a: (number | undefined)[]) => {
    return a.filter(x => (x !== undefined)).reduce((prev, current) => ((prev as number) > (current as number)) ? prev : current, a[0] || 0)
}

export default PositionPdfPlotWidget
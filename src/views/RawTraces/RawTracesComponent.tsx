import { useRecordingSelectionTimeInitialization, useTimeRange } from 'libraries/context-recording-selection'
import { FunctionComponent, useCallback, useEffect, useMemo, useState } from 'react'
import { convert1dDataSeries, use1dScalingMatrix } from 'util/pointProjection'
import { TimeseriesLayoutOpts } from 'View'
import { AmplitudeScaleToolbarEntries } from 'libraries/AmplitudeScaleToolbarEntries'
import { colorForUnitId } from 'libraries/util-unit-colors'
import TimeScrollView from 'views/common/TimeScrollView/TimeScrollView'
import { usePanelDimensions, useTimeseriesMargins } from 'views/common/TimeScrollView/TimeScrollViewDimensions'
import { DefaultToolbarWidth } from 'views/common/TimeWidgetToolbarEntries'
import useFetchCache from 'views/PositionPdfPlot/useFetchCache'

type Props = {
    startTimeSec: number
    samplingFrequency: number
    numFrames: number
    chunkSize: number
    channelIds: number[]
    getTracesData: (o: {ds: number, i: number}) => Promise<number[][] | {min: number[][], max: number[][]}>

    timeseriesLayoutOpts?: TimeseriesLayoutOpts
    width: number
    height: number
}

type PanelProps = {
    color: string
    pixelTimes: number[]
    pixelValuesMin: number[]
    pixelValuesMax: number[] | undefined
}

type FetchChunkQuery = {
    ds: number
    i: number
}

type FetchedChunk = {
    ds: number
    i: number
    chunkSize: number
    min: number[][]
    max: number[][]
}

const RawTracesComponent: FunctionComponent<Props> = ({startTimeSec, samplingFrequency, numFrames, channelIds, chunkSize, getTracesData, timeseriesLayoutOpts, width, height}) => {
    const numSamples = numFrames
    const endTimeSec = startTimeSec + numSamples / samplingFrequency
    useRecordingSelectionTimeInitialization(startTimeSec, endTimeSec)
    const [ampScaleFactor, setAmpScaleFactor] = useState<number>(1)
    const [spentALotOfTimeAtThisView, setSpentALotOfTimeAtThisView] = useState(false)

    const { visibleTimeStartSeconds, visibleTimeEndSeconds } = useTimeRange()

    const margins = useTimeseriesMargins(timeseriesLayoutOpts)

    const toolbarWidth = timeseriesLayoutOpts?.hideToolbar ? 0 : DefaultToolbarWidth
    const numChannels = channelIds.length
    const panelCount = numChannels
    const panelSpacing = 0
    const { panelWidth, panelHeight } = usePanelDimensions(width - toolbarWidth, height, panelCount, panelSpacing, margins)
    const maxNumPoints = 5e7 / numChannels

    const zoomInRequired = useMemo(() => {
        const numPoints = ((visibleTimeEndSeconds || 0) - (visibleTimeStartSeconds || 0)) * samplingFrequency
        return numPoints > maxNumPoints
    }, [visibleTimeStartSeconds, visibleTimeEndSeconds, samplingFrequency, maxNumPoints])

    useEffect(() => {
        setSpentALotOfTimeAtThisView(false)
        let canceled = false
        setTimeout(() => {
            if (canceled) return
            setSpentALotOfTimeAtThisView(true)
        }, 500)
        return () => {canceled = true}
    }, [visibleTimeStartSeconds, visibleTimeEndSeconds, ampScaleFactor])

    const fetchChunk = useMemo(() => (
        async (q: FetchChunkQuery): Promise<FetchedChunk> => {
            if (q.ds === 1) {
                const ch = await getTracesData({ds: q.ds, i: q.i}) as number[][]
                return {
                    ds: q.ds,
                    i: q.i,
                    chunkSize,
                    min: ch,
                    max: ch
                }
            }
            else {
                const {min: chMin, max: chMax} = await getTracesData({ds: q.ds, i: q.i}) as {min: number[][], max: number[][]}
                return {
                    ds: q.ds,
                    i: q.i,
                    chunkSize,
                    min: chMin,
                    max: chMax
                }
            }
        }
    ), [getTracesData, chunkSize])

    const chunkCache = useFetchCache<FetchChunkQuery, FetchedChunk>(fetchChunk)

    const highestDs = useMemo(() => {
        let ds = 1
        while (true) {
            if ((ds * chunkSize >= numFrames) || (ds * chunkSize >= maxNumPoints)) { 
                break
            }
            ds = ds * 3
        }
        return ds
    }, [chunkSize, numFrames, maxNumPoints])

    const chunkTop = useMemo(() => {
        return chunkCache.get({ds: highestDs, i: 0})
    }, [highestDs, chunkCache])

    const valueRanges = useMemo(() => {
        if (!chunkTop) return undefined

        let valueRanges: {min: number, max: number}[] = []
        for (let ich = 0; ich < numChannels; ich ++) {
            valueRanges.push({
                min: min(chunkTop.min.map(x => (x[ich]))),
                max: max(chunkTop.max.map(x => (x[ich])))
            })
        }
        // Next we need to make sure the overall scaling factors are equal between channels?
        const maxSpan = max(valueRanges.map(x => (x.max - x.min)))
        valueRanges.forEach(x => {adjustSpan(x, maxSpan)})
        return valueRanges
    }, [numChannels, chunkTop])

    const paintZoomInRequired = useCallback((context: CanvasRenderingContext2D, props: any) => {
        context.font = '30px Arial'
        context.fillStyle = 'rgb(100, 100, 155)'
        context.fillText('Zoom in to view traces', 50, 50)
    }, [])

    const paintPanel = useCallback((context: CanvasRenderingContext2D, props: PanelProps) => {
        context.strokeStyle = props.color
        context.beginPath()
        if (props.pixelValuesMax) {
            let move = true
            for (let i=0; i<props.pixelTimes.length; i++) {
                const t = props.pixelTimes[i]
                const vMin = props.pixelValuesMin[i]
                const vMax = props.pixelValuesMax[i]
                if (!isNaN(vMin)) {
                    if (move) {
                        context.moveTo(t, vMin)
                    }
                    else {
                        context.lineTo(t, vMin)
                    }
                    context.lineTo(t, vMax)
                    move = true
                }
                else {
                    move = true
                }
            }
        }
        else {
            let move = true
            for (let i=0; i<props.pixelTimes.length; i++) {
                const t = props.pixelTimes[i]
                const vMin = props.pixelValuesMin[i]
                if (!isNaN(vMin)) {
                    if (move) {
                        context.moveTo(t, vMin)
                    }
                    else {
                        context.lineTo(t, vMin)
                    }
                    move = false
                }
                else {
                    move = true
                }
            }
        }
        context.stroke()
    }, [])

    // Here we convert the native (time-based spike registry) data to pixel dimensions based on the per-panel allocated space.
    const timeToPixelMatrix = use1dScalingMatrix(panelWidth, visibleTimeStartSeconds, visibleTimeEndSeconds)

    const getTraceValues = useMemo(() => (
        (ds: number, ich: number, iStart: number, iEnd: number) => {
            const minValues: number[] = []
            const maxValues: number[] | undefined = ds === 1 ? undefined : []
            for (let i = iStart; i < iEnd; i++) {
                minValues.push(NaN)
                if (maxValues) maxValues.push(NaN)
            }
            const iChunk1 = Math.floor(iStart / chunkSize)
            const iChunk2 = Math.floor((iEnd - 1) / chunkSize)
            for (let iChunk = iChunk1; iChunk <= iChunk2; iChunk++) {
                const chunkData = chunkCache.get({ds, i: iChunk})
                if (chunkData) {
                    // check this!
                    // iChunk * chunkSize - iStart + j = 0 => j = -iChunk * chunkSize + iStart
                    const a1 = Math.max(0, -iChunk * chunkSize + iStart)
                    // iChunk * chunkSize - iStart + j = iEnd - iStart => j = iEnd - iChunk * chunkSize + iStart
                    const a2 = Math.min(chunkSize, -iChunk * chunkSize + iEnd)

                    for (let j = a1; j < a2; j++) {
                        if (j < chunkData.min.length) {
                            const k = iChunk * chunkSize - iStart + j
                            minValues[k] = chunkData.min[j][ich]
                            if (maxValues) maxValues[k] = chunkData.max[j][ich]
                        }
                    }
                }
            }
            return {minValues, maxValues}
        }
    ), [chunkCache, chunkSize])

    const pixelPanels: {
        key: string,
        label: string,
        props: PanelProps | any,
        paint: (context: CanvasRenderingContext2D, props: PanelProps) => void
    }[] = useMemo(() => {
        if (zoomInRequired) return [{
            key: 'zoom-in-required',
            label: '',
            props: {},
            paint: paintZoomInRequired
        }]
        const pixelPanels: {
            key: string,
            label: string,
            props: PanelProps,
            paint: (context: CanvasRenderingContext2D, props: PanelProps) => void
        }[] = []

        if (visibleTimeStartSeconds === undefined) return pixelPanels
        if (visibleTimeEndSeconds === undefined) return  pixelPanels
        if (valueRanges === undefined) return pixelPanels

        let i1 = Math.floor((visibleTimeStartSeconds - startTimeSec) * samplingFrequency)
        let i2 = Math.ceil((visibleTimeEndSeconds - startTimeSec) * samplingFrequency)
        i1 = Math.max(0, i1)
        i2 = Math.min(numFrames - 1, i2)

        if (i1 >= i2) return pixelPanels

        function getDs(numPix: number) {
            let ret = 1
            while (true) {
                if ((i2 - i1) / (ret * 3) <= numPix) break
                if (chunkSize * ret >= numFrames) break
                ret *= 3
            }
            return ret
        }

        const ds = spentALotOfTimeAtThisView ? getDs(width * 3) : getDs(width * 0.7)

        const ii1 = Math.floor(i1 / ds)
        const ii2 = Math.floor(i2 / ds)

        const times: number[] = []
        for (let i=ii1; i<=ii2; i++) {
            times.push(startTimeSec + i * ds / samplingFrequency)
        }
        const pixelTimes = convert1dDataSeries(times, timeToPixelMatrix)
        for (let ich = 0; ich < numChannels; ich ++) {
            const pixelValuesMin: number[] = []
            const pixelValuesMax: number[] | undefined = ds === 1 ? undefined : []
            const {minValues, maxValues} = getTraceValues(ds, ich, ii1, ii2 + 1)
            for (let i=ii1; i<=ii2; i++) {
                const valMin = minValues[i - ii1] * ampScaleFactor
                const vMin = panelHeight * (valMin - valueRanges[ich].min) / (valueRanges[ich].max - valueRanges[ich].min)
                pixelValuesMin.push(vMin)
                if ((maxValues) && (pixelValuesMax)) {
                    const valMax = maxValues[i - ii1] * ampScaleFactor
                    const vMax = panelHeight * (valMax - valueRanges[ich].min) / (valueRanges[ich].max - valueRanges[ich].min)
                    pixelValuesMax.push(vMax)
                }
            }
            pixelPanels.push({
                key: `${ich}`,
                label: '',
                props: {
                    color: colorForUnitId(ich),
                    pixelTimes,
                    pixelValuesMin,
                    pixelValuesMax
                },
                paint: paintPanel
            })
        }

        return pixelPanels
    }, [getTraceValues, paintPanel, samplingFrequency, startTimeSec, timeToPixelMatrix, visibleTimeStartSeconds, visibleTimeEndSeconds, panelHeight, valueRanges, ampScaleFactor, numChannels, numFrames, chunkSize, width, spentALotOfTimeAtThisView, zoomInRequired, paintZoomInRequired])

    const scalingActions = useMemo(() => AmplitudeScaleToolbarEntries({ampScaleFactor, setAmpScaleFactor}), [ampScaleFactor])
    const optionalActions = useMemo(() => { return { aboveDefault: scalingActions}}, [scalingActions])

    return visibleTimeStartSeconds === undefined
    ? (<div>Loading...</div>)
    : (
        <TimeScrollView
            margins={margins}
            panels={pixelPanels}
            panelSpacing={panelSpacing}
            timeseriesLayoutOpts={timeseriesLayoutOpts}
            optionalActions={optionalActions}
            width={width}
            height={height}
        />
    )
}

const min = (a: number[]) => {
    return a.reduce((prev, current) => (prev < current) ? prev : current, a[0] || 0)
}

const max = (a: number[]) => {
    return a.reduce((prev, current) => (prev > current) ? prev : current, a[0] || 0)
}

const adjustSpan = (x: {min: number, max: number}, span: number) => {
    const diff = span - (x.max - x.min)
    x.min -= diff / 2
    x.max += diff / 2
}

export default RawTracesComponent
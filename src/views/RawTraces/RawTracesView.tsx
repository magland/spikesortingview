import { useRecordingSelectionTimeInitialization, useTimeRange } from 'contexts/RecordingSelectionContext'
import { matrix, multiply } from 'mathjs'
import React, { FunctionComponent, useCallback, useMemo, useState } from 'react'
import { TimeseriesLayoutOpts } from 'View'
import AmplitudeScaleToolbarEntries from 'views/common/AmplitudeScaleToolbarEntries'
import colorForUnitId from 'views/common/ColorHandling/colorForUnitId'
import { DefaultToolbarWidth } from 'views/common/TimeWidgetToolbarEntries'
import TimeScrollView, { use1dTimeToPixelMatrix, usePanelDimensions, usePixelsPerSecond, useTimeseriesMargins } from '../RasterPlot/TimeScrollView/TimeScrollView'
import { RawTracesViewData } from './RawTracesViewData'

type Props = {
    data: RawTracesViewData
    timeseriesLayoutOpts?: TimeseriesLayoutOpts
    width: number
    height: number
}

type PanelProps = {
    color: string
    pixelTimes: number[]
    pixelValues: number[]
}

const RawTracesView: FunctionComponent<Props> = ({data, timeseriesLayoutOpts, width, height}) => {
    const {startTimeSec, samplingFrequency, traces} = data
    const numSamples = traces.length
    const endTimeSec = startTimeSec + numSamples / samplingFrequency
    useRecordingSelectionTimeInitialization(startTimeSec, endTimeSec)
    const [ampScaleFactor, setAmpScaleFactor] = useState<number>(1)

    const { visibleTimeStartSeconds, visibleTimeEndSeconds } = useTimeRange()

    const margins = useTimeseriesMargins(timeseriesLayoutOpts)

    const toolbarWidth = timeseriesLayoutOpts?.hideToolbar ? 0 : DefaultToolbarWidth
    const numChannels = (traces[0] || []).length
    const panelCount = numChannels
    const panelSpacing = 0
    const { panelWidth, panelHeight } = usePanelDimensions(width - toolbarWidth, height, panelCount, panelSpacing, margins)
    const pixelsPerSecond = usePixelsPerSecond(panelWidth, visibleTimeStartSeconds, visibleTimeEndSeconds)

    const valueRanges = useMemo(() => {
        const valueRanges: {min: number, max: number}[] = []
        for (let ich = 0; ich < numChannels; ich ++) {
            valueRanges.push({
                min: min(traces.map(x => (x[ich]))),
                max: max(traces.map(x => (x[ich])))
            })
        }
        // Next we need to make sure the overall scaling factors are equal between channels?
        const maxSpan = max(valueRanges.map(x => (x.max - x.min)))
        valueRanges.forEach(x => {adjustSpan(x, maxSpan)})
        return valueRanges
    }, [traces, numChannels])

    const paintPanel = useCallback((context: CanvasRenderingContext2D, props: PanelProps) => {
        context.strokeStyle = props.color
        context.beginPath()
        context.moveTo(props.pixelTimes[0], props.pixelValues[0])
        for (let i=1; i<props.pixelTimes.length; i++) {
            context.lineTo(props.pixelTimes[i], props.pixelValues[i])
        }
        context.stroke()
    }, [])

    // Here we convert the native (time-based spike registry) data to pixel dimensions based on the per-panel allocated space.
    const timeToPixelMatrix = use1dTimeToPixelMatrix(pixelsPerSecond, visibleTimeStartSeconds)

    const pixelPanels = useMemo(() => {
        const pixelPanels: {
            key: string,
            label: string,
            props: PanelProps,
            paint: (context: CanvasRenderingContext2D, props: PanelProps) => void
        }[] = []

        if ((visibleTimeStartSeconds !== undefined) && (visibleTimeEndSeconds !== undefined)) {
            let i1 = Math.floor((visibleTimeStartSeconds - startTimeSec) * samplingFrequency)
            let i2 = Math.ceil((visibleTimeEndSeconds - startTimeSec) * samplingFrequency)
            i1 = Math.max(0, i1)
            i2 = Math.min(traces.length - 1, i2)

            if (i1 < i2) {
                const times: number[] = []
                for (let i=i1; i<=i2; i++) {
                    times.push(startTimeSec + i / samplingFrequency)
                }
                const augmentedTimesMatrix = matrix([ times, new Array(times.length).fill(1) ])
                const pixelTimes = multiply(timeToPixelMatrix, augmentedTimesMatrix).valueOf() as number[]
                const numChannels = traces[0].length
                for (let ich = 0; ich < numChannels; ich ++) {
                    const pixelValues: number[] = []
                    for (let i=i1; i<=i2; i++) {
                        const val = traces[i][ich] * ampScaleFactor
                        const v = panelHeight * (val - valueRanges[ich].min) / (valueRanges[ich].max - valueRanges[ich].min)
                        pixelValues.push(v)
                    }
                    pixelPanels.push({
                        key: `${ich}`,
                        label: '',
                        props: {
                            color: colorForUnitId(ich),
                            pixelTimes,
                            pixelValues
                        },
                        paint: paintPanel
                    })
                }
            }
        }

        return pixelPanels
    }, [paintPanel, samplingFrequency, startTimeSec, timeToPixelMatrix, traces, visibleTimeStartSeconds, visibleTimeEndSeconds, panelHeight, valueRanges, ampScaleFactor])

    const scalingActions = useMemo(() => AmplitudeScaleToolbarEntries({ampScaleFactor, setAmpScaleFactor}), [ampScaleFactor])

    return visibleTimeStartSeconds === undefined
    ? (<div>Loading...</div>)
    : (
        <TimeScrollView
            margins={margins}
            panels={pixelPanels}
            panelSpacing={panelSpacing}
            timeseriesLayoutOpts={timeseriesLayoutOpts}
            optionalActionsAboveDefault={scalingActions}
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

export default RawTracesView
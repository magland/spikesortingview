import { useRecordingSelectionTimeInitialization, useTimeRange } from 'contexts/RecordingSelectionContext'
import { useSelectedUnitIds } from 'contexts/RowSelectionContext'
import { matrix, multiply } from 'mathjs'
import React, { FunctionComponent, useCallback, useMemo } from 'react'
import { TimeseriesLayoutOpts } from 'View'
import colorForUnitId from 'views/common/ColorHandling/colorForUnitId'
import { DefaultToolbarWidth } from 'views/common/TimeWidgetToolbarEntries'
import { RasterPlotViewData } from './RasterPlotViewData'
import TimeScrollView, { use1dTimeToPixelMatrix, usePanelDimensions, usePixelsPerSecond, useTimeseriesMargins } from './TimeScrollView/TimeScrollView'

type Props = {
    data: RasterPlotViewData
    timeseriesLayoutOpts?: TimeseriesLayoutOpts
    width: number
    height: number
}

type PanelProps = {
    color: string
    pixelSpikes: number[]
}

const panelSpacing = 4

const RasterPlotView: FunctionComponent<Props> = ({data, timeseriesLayoutOpts, width, height}) => {
    const {selectedUnitIds} = useSelectedUnitIds()

    useRecordingSelectionTimeInitialization(data.startTimeSec, data.endTimeSec)
    const { visibleTimeStartSeconds, visibleTimeEndSeconds } = useTimeRange()

    const margins = useTimeseriesMargins(timeseriesLayoutOpts)

    // Compute the per-panel pixel drawing area dimensions.
    const panelCount = useMemo(() => data.plots.length, [data.plots])
    const toolbarWidth = timeseriesLayoutOpts?.hideToolbar ? 0 : DefaultToolbarWidth
    const { panelWidth, panelHeight } = usePanelDimensions(width - toolbarWidth, height, panelCount, panelSpacing, margins)
    const pixelsPerSecond = usePixelsPerSecond(panelWidth, visibleTimeStartSeconds, visibleTimeEndSeconds)

    // We need to have the panelHeight before we can use it in the paint function.
    // By using a callback, we avoid having to complicate the props passed to the painting function; it doesn't make a big difference
    // but simplifies the prop list a bit.
    const paintPanel = useCallback((context: CanvasRenderingContext2D, props: PanelProps) => {
        context.strokeStyle = props.color
        context.lineWidth = 3.0
        context.beginPath()
        for (const s of props.pixelSpikes) {
            context.moveTo(s, 0)
            context.lineTo(s, panelHeight)
        }
        context.stroke()
    }, [panelHeight])

    // Here we convert the native (time-based spike registry) data to pixel dimensions based on the per-panel allocated space.
    const timeToPixelMatrix = use1dTimeToPixelMatrix(pixelsPerSecond, visibleTimeStartSeconds)

    const pixelPanels = useMemo(() => (data.plots.sort((p1, p2) => (p1.unitId - p2.unitId)).map(plot => {
        const filteredSpikes = plot.spikeTimesSec.filter(t => (visibleTimeStartSeconds !== undefined) && (visibleTimeStartSeconds <= t) && (visibleTimeEndSeconds !== undefined) && (t <= visibleTimeEndSeconds))
        const augmentedSpikesMatrix = matrix([ filteredSpikes, new Array(filteredSpikes.length).fill(1) ])

        // augmentedSpikesMatrix is a 2 x n matrix; each col vector is [time, 1]. The multiplication below gives an
        // n x 1 matrix (n = number of spikes). valueOf() yields the data as a simple array.
        const pixelSpikes = multiply(timeToPixelMatrix, augmentedSpikesMatrix).valueOf() as number[]

        return {
            key: `${plot.unitId}`,
            label: `${plot.unitId}`,
            props: {
                color: colorForUnitId(plot.unitId),
                pixelSpikes: pixelSpikes
            },
            paint: paintPanel
        }
    })), [data.plots, visibleTimeStartSeconds, visibleTimeEndSeconds, timeToPixelMatrix, paintPanel])

    return visibleTimeStartSeconds === undefined
    ? (<div>Loading...</div>)
    : (
        <TimeScrollView
            margins={margins}
            panels={pixelPanels}
            panelSpacing={panelSpacing}
            selectedPanelKeys={selectedUnitIds}
            setSelectedPanelKeys={() => {}}
            highlightSpans={data.highlightIntervals}
            timeseriesLayoutOpts={timeseriesLayoutOpts}
            width={width}
            height={height}
        />
    )
}

export default RasterPlotView
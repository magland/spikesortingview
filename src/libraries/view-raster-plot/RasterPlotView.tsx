import { useRecordingSelectionTimeInitialization, useTimeRange } from 'libraries/context-recording-selection'
import { useSelectedUnitIds } from 'libraries/context-unit-selection'
import { FunctionComponent, useCallback, useMemo } from 'react'
import { convert1dDataSeries, use1dScalingMatrix } from 'libraries/util-point-projection'
import { TimeseriesLayoutOpts } from 'View'
import { colorForUnitId } from '@figurl/core-utils'
import { TimeScrollView } from 'libraries/component-time-scroll-view'
import { usePanelDimensions, useTimeseriesMargins } from 'libraries/component-time-scroll-view'
import { DefaultToolbarWidth } from 'libraries/component-time-scroll-view'
import { RasterPlotViewData } from './RasterPlotViewData'

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

    const timeToPixelMatrix = use1dScalingMatrix(panelWidth, visibleTimeStartSeconds, visibleTimeEndSeconds)

    const maxPointsPerUnit = 3000

    const pixelPanels = useMemo(() => (data.plots.sort((p1, p2) => (p1.unitId - p2.unitId)).map(plot => {
        const filteredSpikes = plot.spikeTimesSec.filter(t => (visibleTimeStartSeconds !== undefined) && (visibleTimeStartSeconds <= t) && (visibleTimeEndSeconds !== undefined) && (t <= visibleTimeEndSeconds))
        const pixelSpikes = subsampleIfNeeded(convert1dDataSeries(filteredSpikes, timeToPixelMatrix), maxPointsPerUnit)

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
            highlightSpans={data.highlightIntervals}
            timeseriesLayoutOpts={timeseriesLayoutOpts}
            width={width}
            height={height}
        />
    )
}

const subsampleIfNeeded = (x: number[], maxNum: number) => {
    if (x.length <= maxNum) {
        return x
    }
    const ret: number[] = []
    const incr = x.length / maxNum
    for (let i = 0; i < maxNum; i ++) {
        const j = Math.floor(i * incr)
        ret.push(x[j])
    }
    return ret
}

export default RasterPlotView
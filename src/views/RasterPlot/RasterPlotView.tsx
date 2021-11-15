import { useRecordingSelectionInitialization, useTimeRange } from 'contexts/RecordingSelectionContext'
import { useSelectedUnitIds } from 'contexts/SortingSelectionContext'
import { matrix, multiply } from 'mathjs'
import React, { FunctionComponent, useCallback, useMemo } from 'react'
import colorForUnitId from 'views/common/colorForUnitId'
import { RasterPlotViewData } from './RasterPlotViewData'
import TimeScrollView, { use1dTimeToPixelMatrix, usePanelDimensions, usePixelsPerSecond } from './TimeScrollView/TimeScrollView'

type Props = {
    data: RasterPlotViewData
    width: number
    height: number
}

type PanelProps = {
    color: string
    pixelSpikes: number[]
}

const margins = {
    left: 30,
    right: 20,
    top: 20,
    bottom: 50
}

const panelSpacing = 4

const RasterPlotView: FunctionComponent<Props> = ({data, width, height}) => {
    const {selectedUnitIds, setSelectedUnitIds} = useSelectedUnitIds()
    const selectedPanelKeys = useMemo(() => (selectedUnitIds.map(u => (`${u}`))), [selectedUnitIds])
    const setSelectedPanelKeys = useCallback((keys: string[]) => {
        setSelectedUnitIds(keys.map(k => (Number(k))))
    }, [setSelectedUnitIds])

    useRecordingSelectionInitialization(data.startTimeSec, data.endTimeSec)
    const { visibleTimeStartSeconds, visibleTimeEndSeconds } = useTimeRange()

    // Compute the per-panel pixel drawing area dimensions.
    const panelCount = useMemo(() => data.plots.length, [data.plots])
    const { panelWidth, panelHeight } = usePanelDimensions(width, height, panelCount, panelSpacing, margins)
    const pixelsPerSecond = usePixelsPerSecond(panelWidth, visibleTimeStartSeconds, visibleTimeEndSeconds)

    // We need to have the panelHeight before we can use it in the paint function.
    // By using a callback, we avoid having to complicate the props passed to the painting function; it doesn't make a big difference
    // but simplifies the prop list a bit.
    const paintPanel = useCallback((context: CanvasRenderingContext2D, props: PanelProps) => {
        context.strokeStyle = props.color
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
        const filteredSpikes = plot.spikeTimesSec.filter(t => (visibleTimeStartSeconds <= t) && (t <= visibleTimeEndSeconds))
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

    return visibleTimeStartSeconds === false
    ? (<div>Loading...</div>)
    : (
        <TimeScrollView
            margins={margins}
            panels={pixelPanels}
            panelSpacing={panelSpacing}
            selectedPanelKeys={selectedPanelKeys}
            setSelectedPanelKeys={setSelectedPanelKeys}
            width={width}
            height={height}
        />
    )
}

export default RasterPlotView
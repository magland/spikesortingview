import { defaultRecordingSelection, useRecordingSelection, useTimeRange } from 'contexts/RecordingSelectionContext'
import { useSelectedUnitIds } from 'contexts/SortingSelectionContext'
import { matrix, multiply } from 'mathjs'
import React, { FunctionComponent, useCallback, useEffect, useMemo } from 'react'
import colorForUnitId from 'views/common/colorForUnitId'
import { RasterPlotViewData } from './RasterPlotViewData'
import TimeScrollView, { computePanelDimensions, computePixelsPerSecond, get1dTimeToPixelMatrix } from './TimeScrollView/TimeScrollView'

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
    const { recordingSelection, recordingSelectionDispatch } = useRecordingSelection()

    useEffect(() => {
        // This check is a bit of defensive coding: I don't know that we actually *need* to cut this off here if
        // we have a non-default recordingSelection; theoretically the reducer should handle this fine.
        // However, better to be sure.
        // We *do* have to call the initialization in a useEffect hook though, otherwise we'll wind up attempting to
        // change the props of App while its child (this Element) is rendering, which is a no-no.
        if (recordingSelection === defaultRecordingSelection) {
            recordingSelectionDispatch({
                type: 'initializeRecordingSelection',
                recordingStartSec: data.startTimeSec,
                recordingEndSec: data.endTimeSec
            })
        }
    // sic: we only want to rerun this if the underlying data changes, not every time recordingselection state changes.
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [data.startTimeSec, data.endTimeSec])

    const { visibleTimeStartSeconds, visibleTimeEndSeconds, zoomRecordingSelecion, panRecordingSelection } = useTimeRange()

    // Compute the per-panel pixel drawing area dimensions.
    const panelCount = useMemo(() => data.plots.length, [data.plots])
    const { panelWidth, panelHeight } = useMemo(() => computePanelDimensions(width, height, panelCount, panelSpacing, margins), [width, height, panelCount])
    const pixelsPerSecond = useMemo(() => 
        computePixelsPerSecond(panelWidth, visibleTimeStartSeconds, visibleTimeEndSeconds),
        [visibleTimeStartSeconds, visibleTimeEndSeconds, panelWidth]
    )

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
    const timeToPixelMatrix = useMemo(() => get1dTimeToPixelMatrix(pixelsPerSecond, data.startTimeSec),
        [pixelsPerSecond, data.startTimeSec])

    const pixelPanels = useMemo(() => (data.plots.sort((p1, p2) => (p1.unitId - p2.unitId)).map(plot => {
        const filteredSpikes = plot.spikeTimesSec.filter(t => (data.startTimeSec <= t) && (t <= data.endTimeSec))
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
    })), [data.plots, data.startTimeSec, data.endTimeSec, timeToPixelMatrix, paintPanel])

    return visibleTimeStartSeconds < 0
    ? (<div>Loading...</div>)
    : (
        <TimeScrollView
            startTimeSec={data.startTimeSec}
            endTimeSec={data.endTimeSec}
            margins={margins}
            panels={pixelPanels}
            panelSpacing={panelSpacing}
            selectedPanelKeys={selectedPanelKeys}
            setSelectedPanelKeys={setSelectedPanelKeys}
            zoomRecordingSelection={zoomRecordingSelecion}
            width={width}
            height={height}
        />
    )
}

export default RasterPlotView
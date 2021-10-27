import { useSelectedUnitIds } from 'contexts/SortingSelectionContext'
import { matrix, multiply } from 'mathjs'
import React, { FunctionComponent, useCallback, useMemo } from 'react'
import { RasterPlotViewData } from './RasterPlotViewData'
import TimeScrollView from './TimeScrollView/TimeScrollView'

type Props = {
    data: RasterPlotViewData
    width: number
    height: number
}

type PanelProps = {
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

    // Compute the per-panel pixel drawing area dimensions.
    const panelCount = useMemo(() => data.plots.length, [data.plots])
    const panelWidth = useMemo(() => width - margins.left - margins.right, [width])
    const panelHeight = useMemo(() => (height - margins.top - margins.bottom - panelSpacing * (panelCount - 1)) / panelCount, [height, panelCount])
    const pixelsPerSecond = useMemo(() => panelWidth / (data.endTimeSec - data.startTimeSec), [data.endTimeSec, data.startTimeSec, panelWidth])

    // Get a 2 x 1 matrix (vector) which we'll use to right-multiply the (augmented) times vectors.
    // The upper element is the conversion factor, the lower element is the offset from the first time unit.
    const timeToPixelMatrix = useMemo(() => matrix([ [pixelsPerSecond], [data.startTimeSec * -pixelsPerSecond] ]),
        [pixelsPerSecond, data.startTimeSec])

    // We need to have the panelHeight before we can use it in the paint function.
    // By using a callback, we avoid having to complicate the props passed to the painting function; it doesn't make a big difference
    // but simplifies the prop list a bit.
    const paintPanel = useCallback((context: CanvasRenderingContext2D, props: PanelProps) => {
        context.strokeStyle = 'darkgray'
        context.beginPath()
        for (const s of props.pixelSpikes) {
            context.moveTo(s, 0)
            context.lineTo(s, panelHeight)
        }
        context.stroke()
    }, [panelHeight])

    // Here we convert the native (time-based spike registry) data to pixel dimensions based on the per-panel allocated space.
    const pixelPanels = useMemo(() => (data.plots.map(plot => {
        const augmentedSpikes = plot.spikeTimesSec
                                    .filter(t => (data.startTimeSec <= t) && (t <= data.endTimeSec))
                                    .map(t => [t, 1])
        const augmentedSpikesMatrix = matrix(augmentedSpikes)
        // augmentedSpikesMatrix is an n x 2 matrix of [time, 1]. The multiplication below gives an
        // n x 1 matrix (n = number of spikes). toArray() yields the data (an array of 1-element arrays).
        // flat() converts the inner arrays (e.g. [[3], [5], [6]]) to just an array of numbers ([3, 5, 6]) which is what we want.
        const pixelSpikes = multiply(augmentedSpikesMatrix, timeToPixelMatrix).toArray().flat()

        return {
            key: `${plot.unitId}`,
            label: `${plot.unitId}`,
            props: {
                pixelSpikes: pixelSpikes
            },
            paint: paintPanel
        }
    })), [data.plots, data.startTimeSec, data.endTimeSec, timeToPixelMatrix, paintPanel])

    return (
        <TimeScrollView
            startTimeSec={data.startTimeSec}
            endTimeSec={data.endTimeSec}
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
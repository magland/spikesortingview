import { useSelectedUnitIds } from 'contexts/SortingSelectionContext'
import { matrix, multiply } from 'mathjs'
import React, { FunctionComponent, useCallback, useMemo } from 'react'
import { SpikeAmplitudesViewData } from './SpikeAmplitudesViewData'
import TimeScrollView, { computePanelDimensions, computePixelsPerSecond, get1dTimeToPixelMatrix, TimeScrollViewPanel } from '../RasterPlot/TimeScrollView/TimeScrollView'
import colorForUnitId from 'views/common/colorForUnitId'

type Props = {
    data: SpikeAmplitudesViewData
    width: number
    height: number
}

type PanelProps = {
    pixelZero: number
    units: {
        unitId: number
        pixelTimes: number[]
        pixelAmplitudes: number[]
    }[]
}

const margins = {
    left: 30,
    right: 20,
    top: 20,
    bottom: 50
}

const panelSpacing = 4

const SpikeAmplitudesView: FunctionComponent<Props> = ({data, width, height}) => {
    const {selectedUnitIds} = useSelectedUnitIds()

    // Compute the per-panel pixel drawing area dimensions.
    const panelCount = 1
    const { panelWidth, panelHeight } = useMemo(() => computePanelDimensions(width, height, panelCount, panelSpacing, margins), [width, height, panelCount])
    const pixelsPerSecond = useMemo(() => computePixelsPerSecond(panelWidth, data.startTimeSec, data.endTimeSec), [data.endTimeSec, data.startTimeSec, panelWidth])

    // We need to have the panelHeight before we can use it in the paint function.
    // By using a callback, we avoid having to complicate the props passed to the painting function; it doesn't make a big difference
    // but simplifies the prop list a bit.
    const paintPanel = useCallback((context: CanvasRenderingContext2D, props: PanelProps) => {
        context.strokeStyle = 'black'
        context.setLineDash([5, 15]);
        context.beginPath()
        context.moveTo(0, props.pixelZero)
        context.lineTo(width, props.pixelZero)
        context.stroke()
        context.setLineDash([]);

        for (let unit of props.units) {
            context.fillStyle = colorForUnitId(unit.unitId)
            for (let i=0; i<unit.pixelTimes.length; i++) {
                const x = unit.pixelTimes[i]
                const y = unit.pixelAmplitudes[i]
                context.beginPath()
                context.ellipse(x, y, 3, 3, 0, 0, Math.PI * 2, false)
                context.fill()
            }
        }
    }, [width])

    // Here we convert the native (time-based spike registry) data to pixel dimensions based on the per-panel allocated space.
    const timeToPixelMatrix = useMemo(() => get1dTimeToPixelMatrix(pixelsPerSecond, data.startTimeSec),
        [pixelsPerSecond, data.startTimeSec])

    const series = useMemo(() => (
        data.units.filter(u => (selectedUnitIds.includes(u.unitId))).map(unit => {
            const filteredTimes = unit.spikeTimesSec.filter(t => (data.startTimeSec <= t) && (t <= data.endTimeSec))
            const filteredAmplitudes = unit.spikeAmplitudes.filter((a, ii) => (data.startTimeSec <= unit.spikeTimesSec[ii]) && (unit.spikeTimesSec[ii] <= data.endTimeSec))
            return {
                unitId: unit.unitId,
                times: filteredTimes,
                amplitudes: filteredAmplitudes
            }
        })
    ), [data.units, data.startTimeSec, data.endTimeSec, selectedUnitIds])

    const amplitudeRange = useMemo(() => {
        const yMin = Math.min(0, min(series.map(S => (min(S.amplitudes)))))
        const yMax = Math.max(0, max(series.map(S => (max(S.amplitudes)))))
        return {yMin, yMax}
    }, [series])

    const panels: TimeScrollViewPanel<PanelProps>[] = useMemo(() => {
        const yMap = ((y: number) => (
            (1 - (y - amplitudeRange.yMin) / (amplitudeRange.yMax - amplitudeRange.yMin)) * panelHeight
        ))
        return [{
            key: `amplitudes`,
            label: ``,
            props: {
                pixelZero: yMap(0),
                units: series.map(S => {
                    const augmentedTimes = matrix([S.times, new Array(S.times.length).fill(1) ])
                    const pixelTimes = multiply(timeToPixelMatrix, augmentedTimes).valueOf() as number[]
                    const pixelAmplitudes = S.amplitudes.map(a => (yMap(a)))                    
                    return {
                        unitId: S.unitId,
                        pixelTimes,
                        pixelAmplitudes
                    }
                })
            } as PanelProps,
            paint: paintPanel
        }]
    }, [series, amplitudeRange, timeToPixelMatrix, paintPanel, panelHeight])

    const selectedPanelKeys = useMemo(() => ([]), [])
    const setSelectedPanelKeys = useCallback((keys: string[]) => {}, [])

    return (
        <TimeScrollView
            startTimeSec={data.startTimeSec}
            endTimeSec={data.endTimeSec}
            margins={margins}
            panels={panels}
            panelSpacing={panelSpacing}
            selectedPanelKeys={selectedPanelKeys}
            setSelectedPanelKeys={setSelectedPanelKeys}
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

export default SpikeAmplitudesView
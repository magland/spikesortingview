import { useRecordingSelectionTimeInitialization, useTimeRange } from 'contexts/RecordingSelectionContext'
import { matrix, multiply } from 'mathjs'
import React, { FunctionComponent, useCallback, useMemo } from 'react'
import colorForUnitId from 'views/common/colorForUnitId'
import TimeScrollView, { TimeScrollViewPanel, use1dTimeToPixelMatrix, usePanelDimensions, usePixelsPerSecond } from '../RasterPlot/TimeScrollView/TimeScrollView'
import { PositionPlotViewData } from './PositionPlotViewData'

type Props = {
    data: PositionPlotViewData
    width: number
    height: number
}

type PanelProps = {
    pixelZero: number
    dimensions: {
        dimensionIndex: number
        dimensionLabel: string
        pixelTimes: number[]
        pixelValues: number[]
    }[]
}

const margins = {
    left: 30,
    right: 20,
    top: 20,
    bottom: 50
}

const panelSpacing = 4

const PositionPlotView: FunctionComponent<Props> = ({data, width, height}) => {
    const {visibleTimeStartSeconds, visibleTimeEndSeconds } = useTimeRange()

    useRecordingSelectionTimeInitialization(data.timestamps[0], data.timestamps[data.timestamps.length - 1])

    // Compute the per-panel pixel drawing area dimensions.
    const panelCount = 1
    const { panelWidth, panelHeight } = usePanelDimensions(width, height, panelCount, panelSpacing, margins)
    const pixelsPerSecond = usePixelsPerSecond(panelWidth, visibleTimeStartSeconds, visibleTimeEndSeconds)

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

        for (let dim of props.dimensions) {
            context.strokeStyle = colorForUnitId(dim.dimensionIndex)
            context.beginPath()
            let first = true
            for (let i=0; i<dim.pixelTimes.length; i++) {
                const x = dim.pixelTimes[i]
                const y = dim.pixelValues[i]
                if (first) context.moveTo(x, y)
                else context.lineTo(x, y)
                first = false
            }
            context.stroke()
        }
    }, [width])

    // Here we convert the native (time-based spike registry) data to pixel dimensions based on the per-panel allocated space.
    const timeToPixelMatrix = use1dTimeToPixelMatrix(pixelsPerSecond, visibleTimeStartSeconds)

    const series = useMemo(() => {
        const series: {dimensionIndex: number, times: number[], values: number[]}[] = []
        for (let dimensionIndex=0; dimensionIndex<data.dimensionLabels.length; dimensionIndex++) {
            const filteredTimes = data.timestamps.filter(t => (visibleTimeStartSeconds <= t) && (t <= visibleTimeEndSeconds))
            const filteredValues = data.timestamps.map((t, ii) => (data.positions[ii][dimensionIndex])).filter((a, ii) => (visibleTimeStartSeconds <= data.timestamps[ii]) && (data.timestamps[ii] <= visibleTimeEndSeconds))
            series.push({
                dimensionIndex,
                times: filteredTimes,
                values: filteredValues
            })
        }
        return series
    }, [data.timestamps, visibleTimeStartSeconds, visibleTimeEndSeconds, data.dimensionLabels, data.positions])

    const valueRange = useMemo(() => {
        const yMin = Math.min(0, min(series.map(S => (min(S.values)))))
        const yMax = Math.max(0, max(series.map(S => (max(S.values)))))
        return {yMin, yMax}
    }, [series])

    const panels: TimeScrollViewPanel<PanelProps>[] = useMemo(() => {
        const yMap = ((y: number) => (
            (1 - (y - valueRange.yMin) / (valueRange.yMax - valueRange.yMin)) * panelHeight
        ))
        return [{
            key: `position`,
            label: ``,
            props: {
                pixelZero: yMap(0),
                dimensions: series.map(S => {
                    const augmentedTimes = matrix([S.times, new Array(S.times.length).fill(1) ])
                    const pixelTimes = multiply(timeToPixelMatrix, augmentedTimes).valueOf() as number[]
                    const pixelValues = S.values.map(a => (yMap(a)))                    
                    return {
                        dimensionIndex: S.dimensionIndex,
                        dimensionLabel: data.dimensionLabels[S.dimensionIndex],
                        pixelTimes,
                        pixelValues
                    }
                })
            } as PanelProps,
            paint: paintPanel
        }]
    }, [series, valueRange, timeToPixelMatrix, paintPanel, panelHeight, data.dimensionLabels])

    const selectedPanelKeys = useMemo(() => ([]), [])
    const setSelectedPanelKeys = useCallback((keys: string[]) => {}, [])

    const content = (
        <TimeScrollView
            margins={margins}
            panels={panels}
            panelSpacing={panelSpacing}
            selectedPanelKeys={selectedPanelKeys}
            setSelectedPanelKeys={setSelectedPanelKeys}
            width={width}
            height={height}
        />
    )
    return content
}

const min = (a: number[]) => {
    return a.reduce((prev, current) => (prev < current) ? prev : current, a[0] || 0)
}

const max = (a: number[]) => {
    return a.reduce((prev, current) => (prev > current) ? prev : current, a[0] || 0)
}

export default PositionPlotView
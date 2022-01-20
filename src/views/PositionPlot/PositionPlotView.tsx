import { useRecordingSelectionTimeInitialization, useTimeRange } from 'contexts/RecordingSelectionContext'
import { matrix, multiply } from 'mathjs'
import React, { FunctionComponent, useCallback, useMemo } from 'react'
import colorForUnitId from 'views/common/colorForUnitId'
import TimeScrollView, { getYAxisPixelZero, TimeScrollViewPanel, use2dPanelDataToPixelMatrix, usePanelDimensions, usePixelsPerSecond } from '../RasterPlot/TimeScrollView/TimeScrollView'
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
    plotType: 'line' | 'scatter'
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

        if (props.plotType === 'line' || !props.plotType) {
            props.dimensions.forEach(dim => {
                context.strokeStyle = colorForUnitId(dim.dimensionIndex)
                context.lineWidth = 1.1 // hack--but fixes the 'disappearing lines' issue
                context.beginPath()
                dim.pixelTimes.forEach((x, ii) => {
                    const y = dim.pixelValues[ii]
                    ii === 0 ? context.moveTo(x, y) : context.lineTo(x, y)
                })
                context.stroke()
            })
        } else if (props.plotType === 'scatter') {

            // it is faster to fill a rect rather than a circle
            // const circleWidthPx = 0.1 // could go even lighter

            props.dimensions.forEach(d => {
                context.fillStyle = colorForUnitId(d.dimensionIndex)
                d.pixelTimes.forEach((t, ii) => {
                    // it is faster to fill a rect rather than a circle
                    // context.beginPath()
                    // context.arc(t, d.pixelValues[ii], circleWidthPx, 0, 2 * Math.PI)
                    // context.fill()

                    context.fillRect(t, d.pixelValues[ii], 1, 1)
                })
            })
        } else {
            console.error(`Invalid plot type in PositionPlotView inputs: ${props.plotType}`)
        }
    }, [width])

    // Here we convert the native (time-based spike registry) data to pixel dimensions based on the per-panel allocated space.
    // const timeToPixelMatrix = use1dTimeToPixelMatrix(pixelsPerSecond, visibleTimeStartSeconds)

    const series = useMemo(() => {
        const series: {dimensionIndex: number, times: number[], values: number[]}[] = []
        const filteredTimeIndices = data.timestamps.flatMap((t, ii) => (visibleTimeStartSeconds <= t) && (t <= visibleTimeEndSeconds) ? ii : [])
        const filteredTimes = filteredTimeIndices.map(i => data.timestamps[i])
        const filteredValues = filteredTimeIndices.map(index => data.positions[index])
        data.dimensionLabels.forEach((d, ii) => {
            series.push({
                dimensionIndex: ii,
                times: filteredTimes,
                values: filteredValues.map(filteredValue => filteredValue[ii])
            })
        })

        // ought to profile these two
        // for (let dimensionIndex=0; dimensionIndex<data.dimensionLabels.length; dimensionIndex++) {
        //     const filteredTimes = data.timestamps.filter(t => (visibleTimeStartSeconds <= t) && (t <= visibleTimeEndSeconds))
        //     const filteredValues = data.timestamps.map((t, ii) => (data.positions[ii][dimensionIndex])).filter((a, ii) => (visibleTimeStartSeconds <= data.timestamps[ii]) && (data.timestamps[ii] <= visibleTimeEndSeconds))
        //     series.push({
        //         dimensionIndex,
        //         times: filteredTimes,
        //         values: filteredValues
        //     })
        // }
        return series
    }, [data.timestamps, visibleTimeStartSeconds, visibleTimeEndSeconds, data.dimensionLabels, data.positions])

    const valueRange = useMemo(() => {
        const yMin = Math.min(0, min(series.map(S => (min(S.values)))))
        const yMax = Math.max(0, max(series.map(S => (max(S.values)))))
        return {yMin, yMax}
    }, [series])

    const pixelTransform = use2dPanelDataToPixelMatrix(
        pixelsPerSecond,
        visibleTimeStartSeconds,
        valueRange.yMin,
        valueRange.yMax,
        1,
        panelHeight,
        true
    )

    const panels: TimeScrollViewPanel<PanelProps>[] = useMemo(() => {
        const pixelZero = getYAxisPixelZero(pixelTransform)
        // this could also be done as one matrix multiplication by concatenating the dimensions;
        // and we could even separate out the time series values (which are repeated). But probably not worth it.
        // TODO: ought to profile these two versions
        const pixelData = series.map(s => {
            const augmentedPoints = matrix([ s.times, s.values, new Array(s.times.length).fill(1) ])
            const pixelPoints = multiply(pixelTransform, augmentedPoints).valueOf() as number[][]
            return {
                dimensionIndex: s.dimensionIndex,
                dimensionLabel: data.dimensionLabels[s.dimensionIndex],
                pixelTimes: pixelPoints[0],
                pixelValues: pixelPoints[1]
            }
        })
        return [{
            key: `position`,
            label: ``,
            props: {
                pixelZero: pixelZero,
                dimensions: pixelData,
                plotType: data.type === 'PositionPlotScatter' ? 'scatter' : 'line'
                // plotType: 'scatter'
            } as PanelProps,
            paint: paintPanel
        }]
    }, [series, pixelTransform, paintPanel, data.dimensionLabels, data.type])

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
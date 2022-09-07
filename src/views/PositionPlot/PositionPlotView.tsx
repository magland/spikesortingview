import { useRecordingSelectionTimeInitialization, useTimeRange } from 'libraries/RecordingSelectionContext'
import { colorForUnitId } from 'libraries/UnitColors'
import { matrix, multiply } from 'mathjs'
import { FunctionComponent, useCallback, useMemo } from 'react'
import { TimeseriesLayoutOpts } from 'View'
import useYAxisTicks from 'views/common/TimeScrollView/YAxisTicks'
import { DefaultToolbarWidth } from 'views/common/TimeWidgetToolbarEntries'
import TimeScrollView, { getYAxisPixelZero, TimeScrollViewPanel, use2dPanelDataToPixelMatrix, usePanelDimensions, usePixelsPerSecond, useProjectedYAxisTicks, useTimeseriesMargins } from '../RasterPlot/TimeScrollView/TimeScrollView'
import { PositionPlotViewData } from './PositionPlotViewData'

type Props = {
    data: PositionPlotViewData
    timeseriesLayoutOpts?: TimeseriesLayoutOpts
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

const panelSpacing = 4
const emptyPanelSelection = new Set<number | string>()

const PositionPlotView: FunctionComponent<Props> = ({data, timeseriesLayoutOpts, width, height}) => {
    const {timestamps, positions, dimensionLabels, discontinuous, timeOffset} = data

    // This component ignores timeOffset except in the following two hooks
    useRecordingSelectionTimeInitialization(timestamps[0], timestamps[timestamps.length - 1], timeOffset) // timeOffset is added to start and end before setting to the global state
    const {visibleTimeStartSeconds, visibleTimeEndSeconds } = useTimeRange(timeOffset) // timeOffset is subtracted from start and end after getting from the global state

    const margins = useTimeseriesMargins(timeseriesLayoutOpts)

    // Compute the per-panel pixel drawing area dimensions.
    const panelCount = 1
    const toolbarWidth = timeseriesLayoutOpts?.hideToolbar ? 0 : DefaultToolbarWidth
    const { panelWidth, panelHeight } = usePanelDimensions(width - toolbarWidth, height, panelCount, panelSpacing, margins)
    const pixelsPerSecond = usePixelsPerSecond(panelWidth, visibleTimeStartSeconds, visibleTimeEndSeconds)

    // We need to have the panelHeight before we can use it in the paint function.
    // By using a callback, we avoid having to complicate the props passed to the painting function; it doesn't make a big difference
    // but simplifies the prop list a bit.
    const paintPanel = useCallback((context: CanvasRenderingContext2D, props: PanelProps) => {
        context.strokeStyle = 'black'
        context.setLineDash([5, 15]);
        context.beginPath()
        context.moveTo(0, props.pixelZero)
        context.lineTo(panelWidth, props.pixelZero)
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
            props.dimensions.forEach(d => {
                context.fillStyle = colorForUnitId(d.dimensionIndex)
                d.pixelTimes.forEach((t, ii) => {
                    context.fillRect(t - 0.5, d.pixelValues[ii] - 0.5, 1, 1)
                })
            })
        } else {
            console.error(`Invalid plot type in PositionPlotView inputs: ${props.plotType}`)
        }
    }, [panelWidth])

    // Here we convert the native (time-based spike registry) data to pixel dimensions based on the per-panel allocated space.
    // const timeToPixelMatrix = use1dTimeToPixelMatrix(pixelsPerSecond, visibleTimeStartSeconds)

    const series = useMemo(() => {
        const series: {dimensionIndex: number, times: number[], values: number[]}[] = []
        if ((visibleTimeStartSeconds === undefined) || (visibleTimeEndSeconds === undefined)) {
            return series
        }
        const filteredTimeIndices = timestamps.flatMap((t, ii) => (visibleTimeStartSeconds <= t) && (t <= visibleTimeEndSeconds) ? ii : [])
        const filteredTimes = filteredTimeIndices.map(i => timestamps[i])
        const filteredValues = filteredTimeIndices.map(index => positions[index])
        dimensionLabels.forEach((d, ii) => {
            series.push({
                dimensionIndex: ii,
                times: filteredTimes,
                values: filteredValues.map(filteredValue => filteredValue[ii])
            })
        })

        // ought to profile these two
        // for (let dimensionIndex=0; dimensionIndex<dimensionLabels.length; dimensionIndex++) {
        //     const filteredTimes = timestamps.filter(t => (visibleTimeStartSeconds <= t) && (t <= visibleTimeEndSeconds))
        //     const filteredValues = timestamps.map((t, ii) => (positions[ii][dimensionIndex])).filter((a, ii) => (visibleTimeStartSeconds <= timestamps[ii]) && (timestamps[ii] <= visibleTimeEndSeconds))
        //     series.push({
        //         dimensionIndex,
        //         times: filteredTimes,
        //         values: filteredValues
        //     })
        // }
        return series
    }, [timestamps, visibleTimeStartSeconds, visibleTimeEndSeconds, dimensionLabels, positions])

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

    // TODO: All this computational stuff should probably get pushed to the TimeScrollView...
    const yTicks = useYAxisTicks({ datamin: valueRange.yMin, datamax: valueRange.yMax, pixelHeight: panelHeight })
    const yTickSet = useProjectedYAxisTicks(yTicks, pixelTransform)
    
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
                dimensionLabel: dimensionLabels[s.dimensionIndex],
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
                plotType: discontinuous ? 'scatter' : 'line',
            } as PanelProps,
            paint: paintPanel
        }]
    }, [series, pixelTransform, paintPanel, dimensionLabels, discontinuous])

    const content = (
        <TimeScrollView
            margins={margins}
            panels={panels}
            panelSpacing={panelSpacing}
            selectedPanelKeys={emptyPanelSelection}
            timeseriesLayoutOpts={timeseriesLayoutOpts}
            yTickSet={yTickSet}
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
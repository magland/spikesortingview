import { DefaultToolbarWidth, TimeScrollView, TimeScrollViewPanel, usePanelDimensions, useProjectedYAxisTicks, useTimeseriesMargins, useYAxisTicks } from 'libraries/component-time-scroll-view'
import { useRecordingSelectionTimeInitialization, useTimeRange } from 'libraries/context-recording-selection'
import { convert2dDataSeries, getYAxisPixelZero, use2dScalingMatrix } from 'libraries/util-point-projection'
import { FunctionComponent, useCallback, useMemo } from 'react'
import { TimeseriesLayoutOpts } from 'View'
import { TimeseriesGraphViewData } from './TimeseriesGraphViewData'

type Props = {
    data: TimeseriesGraphViewData
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
        type: string
        attributes: {[key: string]: any}
    }[]
}

const panelSpacing = 4
const emptyPanelSelection = new Set<number | string>()

const TimeseriesGraphView: FunctionComponent<Props> = ({data, timeseriesLayoutOpts, width, height}) => {
    const {datasets, series} = data

    const resolvedSeries = useMemo(() => (
        series.map(s => {
            const ds = datasets.filter(d => (d.name === s.dataset))[0]
            if (ds === undefined) throw Error(`Dataset not found in series: ${s.dataset}`)
            return {
                ...s,
                t: ds.data[s.encoding['t']],
                y: ds.data[s.encoding['y']]
            }
        })
    ), [series, datasets])

    const {minTime, maxTime} = useMemo(() => (
        {
            minTime: min(resolvedSeries.map(s => (min(s.t)))),
            maxTime: max(resolvedSeries.map(s => (max(s.t))))
        }
    ), [resolvedSeries])

    const {minValue, maxValue} = useMemo(() => (
        {
            minValue: min(resolvedSeries.map(s => (min(s.y)))),
            maxValue: max(resolvedSeries.map(s => (max(s.y))))
        }
    ), [resolvedSeries])

    // This component ignores timeOffset except in the following two hooks
    useRecordingSelectionTimeInitialization(minTime, maxTime, 0)
    const {visibleTimeStartSeconds, visibleTimeEndSeconds } = useTimeRange(0) // timeOffset is subtracted from start and end after getting from the global state

    const margins = useTimeseriesMargins(timeseriesLayoutOpts)

    // Compute the per-panel pixel drawing area dimensions.
    const panelCount = 1
    const toolbarWidth = timeseriesLayoutOpts?.hideToolbar ? 0 : DefaultToolbarWidth
    const { panelWidth, panelHeight } = usePanelDimensions(width - toolbarWidth, height, panelCount, panelSpacing, margins)

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

        props.dimensions.forEach(dim => {
            if (dim.type === 'line') {
                context.strokeStyle = dim.attributes['color'] || 'black'
                context.lineWidth = 1.1 // hack--but fixes the 'disappearing lines' issue
                context.beginPath()
                dim.pixelTimes.forEach((x, ii) => {
                    const y = dim.pixelValues[ii]
                    ii === 0 ? context.moveTo(x, y) : context.lineTo(x, y)
                })
                context.stroke()
            }
            else if (dim.type === 'marker') {
                context.fillStyle = dim.attributes['color'] || 'black'
                dim.pixelTimes.forEach((t, ii) => {
                    context.fillRect(t - 2, dim.pixelValues[ii] - 2, 4, 4)
                })
            }
        })
    }, [panelWidth])

    const plotSeries = useMemo(() => {
        const plotSeries: {type: string, times: number[], values: number[], attributes: {[key: string]: any}}[] = []
        if ((visibleTimeStartSeconds === undefined) || (visibleTimeEndSeconds === undefined)) {
            return plotSeries
        }
        resolvedSeries.forEach(rs => {
            const filteredTimeIndices: number[] = rs.t.flatMap((t: number, ii: number) => (visibleTimeStartSeconds <= t) && (t <= visibleTimeEndSeconds) ? ii : [])
            const filteredTimes = filteredTimeIndices.map(i => rs.t[i])
            const filteredValues = filteredTimeIndices.map(index => rs.y[index])
            plotSeries.push({
                type: rs.type,
                times: filteredTimes,
                values: filteredValues,
                attributes: rs.attributes
            })
        })
        return plotSeries
    }, [visibleTimeStartSeconds, visibleTimeEndSeconds, resolvedSeries])

    const pixelTransform = use2dScalingMatrix({
        totalPixelWidth: panelWidth,
        totalPixelHeight: panelHeight,
        // margins have already been accounted for since we use a panel-oriented scaling function here
        dataXMin: visibleTimeStartSeconds,
        dataXMax: visibleTimeEndSeconds,
        dataYMin: minValue,
        dataYMax: maxValue
    })

    // TODO: y-axis management should probably get pushed to the TimeScrollView...
    const yTicks = useYAxisTicks({ datamin: minValue, datamax: maxValue, pixelHeight: panelHeight })
    const yTickSet = useProjectedYAxisTicks(yTicks, pixelTransform)
    
    const panels: TimeScrollViewPanel<PanelProps>[] = useMemo(() => {
        const pixelZero = getYAxisPixelZero(pixelTransform)
        // this could also be done as one matrix multiplication by concatenating the dimensions;
        // and we could even separate out the time series values (which are repeated). But probably not worth it.
        // TODO: ought to profile these two versions
        const pixelData = plotSeries.map((s, i) => {
            const pixelPoints = convert2dDataSeries(pixelTransform, [s.times, s.values])
            return {
                dimensionIndex: i,
                dimensionLabel: `${i}`,
                pixelTimes: pixelPoints[0],
                pixelValues: pixelPoints[1],
                type: s.type,
                attributes: s.attributes
            }
        })
        return [{
            key: `position`,
            label: ``,
            props: {
                pixelZero: pixelZero,
                dimensions: pixelData
            } as PanelProps,
            paint: paintPanel
        }]
    }, [pixelTransform, paintPanel, plotSeries])

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

export default TimeseriesGraphView
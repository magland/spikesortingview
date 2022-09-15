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
    const {datasets, series, legendOpts, timeOffset} = data

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
    useRecordingSelectionTimeInitialization(minTime, maxTime, timeOffset || 0)
    const {visibleTimeStartSeconds, visibleTimeEndSeconds } = useTimeRange(timeOffset || 0) // timeOffset is subtracted from start and end after getting from the global state

    const margins = useTimeseriesMargins(timeseriesLayoutOpts)

    // Compute the per-panel pixel drawing area dimensions.
    const panelCount = 1
    const toolbarWidth = timeseriesLayoutOpts?.hideToolbar ? 0 : DefaultToolbarWidth
    const { panelWidth, panelHeight } = usePanelDimensions(width - toolbarWidth, height, panelCount, panelSpacing, margins)

    const paintLegend = useCallback((context: CanvasRenderingContext2D) => {
        let opts = legendOpts
        if (!opts) {
            opts = {location: 'northeast'} // for testing
        }
        const seriesToInclude = series.filter(s => (s.title))
        if (seriesToInclude.length === 0) return
        const {location} = opts
        const entryHeight = 18
        const entryFontSize = 12
        const symbolWidth = 50
        const legendWidth = 200
        const margin = 10
        const legendHeight = 20 + seriesToInclude.length * entryHeight
        const R = location === 'northwest' ? {x: 20, y: 20, w: legendWidth, h: legendHeight} :
                  location === 'northeast' ? {x: panelWidth - legendWidth - 20, y: 20, w: legendWidth, h: legendHeight} : undefined
        if (!R) return //unexpected
        context.fillStyle = 'white'
        context.strokeStyle = 'gray'
        context.lineWidth = 1.5
        context.fillRect(R.x, R.y, R.w, R.h)
        context.strokeRect(R.x, R.y, R.w, R.h)

        seriesToInclude.forEach((s, i) => {
            const y0 = R.y + margin + i * entryHeight
            const symbolRect = {x: R.x + margin, y: y0, w: symbolWidth, h: entryHeight}
            const titleRect = {x: R.x + margin + symbolWidth + margin, y: y0, w: legendWidth - margin - margin - symbolWidth - margin, h: entryHeight}
            const title = s.title || 'untitled'
            context.fillStyle = 'black'
            context.font = `${entryFontSize}px Arial`
            context.fillText(title, titleRect.x, titleRect.y + titleRect.h / 2 + entryFontSize / 2)
            if (s.type === 'line') {
                applyLineAttributes(context, s.attributes)
                context.beginPath()
                context.moveTo(symbolRect.x, symbolRect.y + symbolRect.h / 2)
                context.lineTo(symbolRect.x + symbolRect.w, symbolRect.y + symbolRect.h / 2)
                context.stroke()
                context.setLineDash([])
            }
            else if (s.type === 'marker') {
                applyMarkerAttributes(context, s.attributes)
                const radius = entryHeight * 0.3
                const shape = s.attributes['shape'] ?? 'circle'
                const center = {x: symbolRect.x + symbolRect.w / 2, y: symbolRect.y + symbolRect.h / 2}
                if (shape === 'circle') {
                    context.beginPath()
                    context.ellipse(center.x, center.y, radius, radius, 0, 0, 2 * Math.PI)
                    context.fill()
                }
                else if (shape === 'square') {
                    context.fillRect(center.x - radius, center.y - radius, radius * 2, radius * 2)
                }
            }
        })
    }, [legendOpts, series, panelWidth])

    // We need to have the panelHeight before we can use it in the paint function.
    // By using a callback, we avoid having to complicate the props passed to the painting function; it doesn't make a big difference
    // but simplifies the prop list a bit.
    const paintPanel = useCallback((context: CanvasRenderingContext2D, props: PanelProps) => {
        // don't display dashed zero line (Eric's request)
        // context.strokeStyle = 'black'
        // context.setLineDash([5, 15]);
        // context.lineWidth = 1
        // context.beginPath()
        // context.moveTo(0, props.pixelZero)
        // context.lineTo(panelWidth, props.pixelZero)
        // context.stroke()
        // context.setLineDash([]);

        props.dimensions.forEach(dim => {
            if (dim.type === 'line') {
                applyLineAttributes(context, dim.attributes)
                context.beginPath()
                dim.pixelTimes.forEach((x, ii) => {
                    const y = dim.pixelValues[ii]
                    ii === 0 ? context.moveTo(x, y) : context.lineTo(x, y)
                })
                context.stroke()
                context.setLineDash([])
            }
            else if (dim.type === 'marker') {
                applyMarkerAttributes(context, dim.attributes)
                const radius = dim.attributes['radius'] ?? 2
                const shape = dim.attributes['shape'] ?? 'circle'
                if (shape === 'circle') {
                    dim.pixelTimes.forEach((t, ii) => {
                        context.beginPath()
                        context.ellipse(t, dim.pixelValues[ii], radius, radius, 0, 0, 2 * Math.PI)
                        context.fill()
                    })
                }
                else if (shape === 'square') {
                    dim.pixelTimes.forEach((t, ii) => {
                        context.fillRect(t - radius, dim.pixelValues[ii] - radius, radius * 2, radius * 2)
                    })
                }
            }
        })

        paintLegend(context)
    }, [paintLegend])

    const plotSeries = useMemo(() => {
        const plotSeries: {type: string, times: number[], values: number[], attributes: {[key: string]: any}}[] = []
        if ((visibleTimeStartSeconds === undefined) || (visibleTimeEndSeconds === undefined)) {
            return plotSeries
        }
        resolvedSeries.forEach(rs => {
            let filteredTimeIndices: number[] = rs.t.flatMap((t: number, ii: number) => (visibleTimeStartSeconds <= t) && (t <= visibleTimeEndSeconds) ? ii : [])

            // need to prepend an index before and append an index after so that lines get rendered properly
            if ((filteredTimeIndices[0] || 0) > 0) {
                filteredTimeIndices = [filteredTimeIndices[0] - 1, ...filteredTimeIndices]
            }
            if ((filteredTimeIndices[filteredTimeIndices.length - 1] || rs.t.length) < rs.t.length - 1) {
                filteredTimeIndices.push(filteredTimeIndices[filteredTimeIndices.length - 1] + 1)
            }
            ////////////////////////////////////////////////////////////////////////////////

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

const applyLineAttributes = (context: CanvasRenderingContext2D, attributes: any) => {
    context.strokeStyle = attributes['color'] ?? 'black'
    context.lineWidth = attributes['width'] ?? 1.1 // 1.1 hack--but fixes the 'disappearing lines' issue
    attributes['dash'] && context.setLineDash(attributes['dash'])
}

const applyMarkerAttributes = (context: CanvasRenderingContext2D, attributes: any) => {
    context.fillStyle = attributes['color'] ?? 'black'
}

const min = (a: number[]) => {
    return a.reduce((prev, current) => (prev < current) ? prev : current, a[0] || 0)
}

const max = (a: number[]) => {
    return a.reduce((prev, current) => (prev > current) ? prev : current, a[0] || 0)
}

export default TimeseriesGraphView
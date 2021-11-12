import { useRecordingSelectionInitialization, useTimeRange } from 'contexts/RecordingSelectionContext'
import { matrix, multiply } from 'mathjs'
import React, { FunctionComponent, useCallback, useMemo } from 'react'
import TimeScrollView, { TimeScrollViewPanel, use1dTimeToPixelMatrix, usePanelDimensions, usePixelsPerSecond } from '../RasterPlot/TimeScrollView/TimeScrollView'
import { PositionPdfPlotViewData } from './PositionPdfPlotViewData'

type Props = {
    data: PositionPdfPlotViewData
    width: number
    height: number
}

type PanelProps = {
}

const margins = {
    left: 30,
    right: 20,
    top: 20,
    bottom: 50
}

const panelSpacing = 4

const PositionPdfPlotView: FunctionComponent<Props> = ({data, width, height}) => {
    useRecordingSelectionInitialization(data.startTimeSec, data.endTimeSec)
    const { visibleTimeStartSeconds, visibleTimeEndSeconds } = useTimeRange()

    const {visibleValues, visibleTimes} = useMemo(() => {
        const visibleValues: number[][] = []
        const visibleTimes: number[] = []
        for (let i = 0; i < data.timeCoord.length; i++) {
            const t = data.timeCoord[i]
            if ((visibleTimeStartSeconds <= t) && (t <= visibleTimeEndSeconds)) {
                visibleTimes.push(t)
                visibleValues.push(data.pdf[i])
            }
        }
        return {visibleValues, visibleTimes}
    }, [data.timeCoord, data.pdf, visibleTimeStartSeconds, visibleTimeEndSeconds])

    const panelCount = 1
    const { panelWidth, panelHeight } = usePanelDimensions(width, height, panelCount, panelSpacing, margins)
    const pixelsPerSecond = usePixelsPerSecond(panelWidth, visibleTimeStartSeconds, visibleTimeEndSeconds)
    const timeToPixelMatrix = use1dTimeToPixelMatrix(pixelsPerSecond, visibleTimeStartSeconds)

    const pixelTimes = useMemo(() => {
        const augmentedVisibleTimesMatrix = matrix([ visibleTimes, new Array(visibleTimes.length).fill(1) ])
        const pixelTimes = multiply(timeToPixelMatrix, augmentedVisibleTimesMatrix).valueOf() as number[]
        return pixelTimes
    }, [visibleTimes, timeToPixelMatrix])

    const pixelPositions = useMemo(() => {
        const minPosition = min(data.positionCoord)
        const maxPosition = max(data.positionCoord)
        const pixelPositions = data.positionCoord.map(x => (
            (1 - (x - minPosition) / (maxPosition - minPosition)) * panelHeight
        ))
        return pixelPositions
    }, [data.positionCoord, panelHeight])

    const {minValue, maxValue} = useMemo(() => {
        return {
            minValue: min(visibleValues.map(a => (min(a)))),
            maxValue: max(visibleValues.map(a => (max(a)))),
        }
    }, [visibleValues])

    const paintPanel = useCallback((context: CanvasRenderingContext2D, props: PanelProps) => {
        for (let i = 0; i < pixelTimes.length; i++) {
            const deltaPixelTime = (i + 1 < pixelTimes.length) ? (pixelTimes[i + 1] - pixelTimes[i]) : (pixelTimes[i] - pixelTimes[i - 1])
            for (let j = 0; j < pixelPositions.length; j++) {
                const deltaPixelPosition = (j + 1 < pixelPositions.length) ? (pixelPositions[j] - pixelPositions[j + 1]) : (pixelPositions[j - 1] - pixelPositions[j])
                const v = (visibleValues[i][j] - minValue) / (maxValue - minValue)
                const color = colorForValue(v)
                const x0 = pixelTimes[i]
                const y0 = pixelPositions[j] - deltaPixelPosition - 1
                const w0 = deltaPixelTime + 1
                const h0 = deltaPixelPosition + 1
                context.fillStyle = color
                context.fillRect(x0, y0, w0, h0)
            }
        }
    }, [pixelTimes, pixelPositions, minValue, maxValue, visibleValues])

    const panels: TimeScrollViewPanel<PanelProps>[] = useMemo(() => {
        return [{
            key: `pdf`,
            label: ``,
            props: {} as PanelProps,
            paint: paintPanel
        }]
    }, [paintPanel])

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

const colorForValue = (v: number) => {
    const a = Math.max(0, Math.min(255, Math.floor(v * 255) * 3))
    return `rgb(${a},0,${a})`
}

const min = (a: number[]) => {
    return a.reduce((prev, current) => (prev < current) ? prev : current, a[0] || 0)
}

const max = (a: number[]) => {
    return a.reduce((prev, current) => (prev > current) ? prev : current, a[0] || 0)
}

export default PositionPdfPlotView
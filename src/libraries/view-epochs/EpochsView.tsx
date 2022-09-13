import { useTimeRange } from 'libraries/context-recording-selection'
import { FunctionComponent, useCallback, useMemo } from 'react'
import { convert1dDataSeries, use1dScalingMatrix } from 'libraries/util-point-projection'
import { TimeseriesLayoutOpts } from 'View'
import { TimeScrollView, TimeScrollViewPanel } from 'libraries/component-time-scroll-view'
import { usePanelDimensions, useTimeseriesMargins } from 'libraries/component-time-scroll-view'
import { DefaultToolbarWidth } from 'libraries/component-time-scroll-view'
import { EpochData, EpochsViewData } from './EpochsViewData'

type Props = {
    data: EpochsViewData
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
}

const panelSpacing = 4

const emptyPanelSelection = new Set<number | string>()

const EpochsView: FunctionComponent<Props> = ({data, timeseriesLayoutOpts, width, height}) => {
    const {visibleTimeStartSeconds, visibleTimeEndSeconds } = useTimeRange()

    const margins = useTimeseriesMargins(timeseriesLayoutOpts)

    // Compute the per-panel pixel drawing area dimensions.
    const panelCount = 1
    const toolbarWidth = timeseriesLayoutOpts?.hideToolbar ? 0 : DefaultToolbarWidth
    const { panelWidth, panelHeight } = usePanelDimensions(width - toolbarWidth, height, panelCount, panelSpacing, margins)

    const { epochs } = data

    const timeToPixelMatrix = use1dScalingMatrix(panelWidth, visibleTimeStartSeconds, visibleTimeEndSeconds)

    const pixelEpochs = useMemo(() => { 
        const ret: {startPixel: number, endPixel: number, epoch: EpochData}[] = []
        if ((visibleTimeStartSeconds === undefined) || (visibleTimeEndSeconds === undefined)) {
            return ret
        }
        for (let epoch of epochs) {
            if ((epoch.startTime <= visibleTimeEndSeconds) && (epoch.endTime >= visibleTimeStartSeconds)) {
                const pixelTimes = convert1dDataSeries([epoch.startTime, epoch.endTime], timeToPixelMatrix)
                ret.push({
                    startPixel: pixelTimes[0],
                    endPixel: pixelTimes[1],
                    epoch
                })
            }
        }
        return ret
    }, [epochs, visibleTimeStartSeconds, visibleTimeEndSeconds, timeToPixelMatrix])

    const paintPanel = useCallback((context: CanvasRenderingContext2D, props: PanelProps) => {
        context.clearRect(0, 0, panelWidth, panelHeight)
        for (let E of pixelEpochs) {
            context.fillStyle = 'lightgray'
            context.strokeStyle = 'gray'
            context.fillRect(E.startPixel, 0, E.endPixel - E.startPixel, panelHeight)
            context.strokeRect(E.startPixel, 0, E.endPixel - E.startPixel, panelHeight)
            context.fillStyle = 'black'
            context.fillText(E.epoch.label, Math.max(E.startPixel, 0) + 10, 20)
        }
    }, [pixelEpochs, panelWidth, panelHeight])

    const panels: TimeScrollViewPanel<PanelProps>[] = useMemo(() => {
        return [{
            key: `epochs`,
            label: ``,
            props: {
            } as PanelProps,
            paint: paintPanel
        }]
    }, [paintPanel])

    const content = (
        <TimeScrollView
            margins={margins}
            panels={panels}
            panelSpacing={panelSpacing}
            selectedPanelKeys={emptyPanelSelection}
            timeseriesLayoutOpts={timeseriesLayoutOpts}
            width={width}
            height={height}
        />
    )
    return content
}

export default EpochsView
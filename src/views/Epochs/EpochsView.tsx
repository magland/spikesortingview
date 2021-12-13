import { useTimeRange } from 'contexts/RecordingSelectionContext'
import { matrix, multiply } from 'mathjs'
import React, { FunctionComponent, useCallback, useMemo } from 'react'
import TimeScrollView, { TimeScrollViewPanel, use1dTimeToPixelMatrix, usePanelDimensions, usePixelsPerSecond } from '../RasterPlot/TimeScrollView/TimeScrollView'
import { EpochData, EpochsViewData } from './EpochsViewData'

type Props = {
    data: EpochsViewData
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

const EpochsView: FunctionComponent<Props> = ({data, width, height}) => {
    const {visibleTimeStartSeconds, visibleTimeEndSeconds } = useTimeRange()

    // Compute the per-panel pixel drawing area dimensions.
    const panelCount = 1
    const { panelWidth, panelHeight } = usePanelDimensions(width, height, panelCount, panelSpacing, margins)
    const pixelsPerSecond = usePixelsPerSecond(panelWidth, visibleTimeStartSeconds, visibleTimeEndSeconds)

    const { epochs } = data

    // Here we convert the native (time-based spike registry) data to pixel dimensions based on the per-panel allocated space.
    const timeToPixelMatrix = use1dTimeToPixelMatrix(pixelsPerSecond, visibleTimeStartSeconds)

    const pixelEpochs = useMemo(() => { 
        const ret: {startPixel: number, endPixel: number, epoch: EpochData}[] = []
        for (let epoch of epochs) {
            if ((epoch.startTime <= visibleTimeEndSeconds) && (epoch.endTime >= visibleTimeStartSeconds)) {
                const augmentedTimes = matrix([[epoch.startTime, epoch.endTime], new Array(2).fill(1) ])
                const pixelTimes = multiply(timeToPixelMatrix, augmentedTimes).valueOf() as number[]
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

export default EpochsView
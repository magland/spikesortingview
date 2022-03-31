import { useRecordingSelectionTimeInitialization, useTimeRange } from 'contexts/RecordingSelectionContext'
import { matrix, multiply } from 'mathjs'
import Splitter from 'MountainWorkspace/components/Splitter/Splitter'
import React, { FunctionComponent, useMemo, useState } from 'react'
import { TimeseriesLayoutOpts } from 'View'
import AmplitudeScaleToolbarEntries from 'views/common/AmplitudeScaleToolbarEntries'
import colorForUnitId from 'views/common/ColorHandling/colorForUnitId'
import LockableSelectUnitsWidget from 'views/common/SelectUnitsWidget/LockableSelectUnitsWidget'
import useLocalSelectedUnitIds from 'views/common/SelectUnitsWidget/useLocalSelectedUnitIds'
import useYAxisTicks, { TickSet } from 'views/common/TimeScrollView/YAxisTicks'
import { DefaultToolbarWidth } from 'views/common/TimeWidgetToolbarEntries'
import TimeScrollView, { TimeScrollViewPanel, use2dPanelDataToPixelMatrix, usePanelDimensions, usePixelsPerSecond, useProjectedYAxisTicks, useTimeseriesMargins } from '../RasterPlot/TimeScrollView/TimeScrollView'
import { SpikeAmplitudesViewData } from './SpikeAmplitudesViewData'

type Props = {
    data: SpikeAmplitudesViewData
    timeseriesLayoutOpts?: TimeseriesLayoutOpts
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

const panelSpacing = 4

const SpikeAmplitudesView: FunctionComponent<Props> = ({data, timeseriesLayoutOpts, width, height}) => {
    const {selectedUnitIds, orderedRowIds, visibleRowIds, checkboxClickHandlerGenerator, unitIdSelectionDispatch, selectionLocked, toggleSelectionLocked} = useLocalSelectedUnitIds()

    const allUnitIds = useMemo(() => (
        data.units.map(u => (u.unitId))
    ), [data.units])
    
    return (
        <Splitter
            width={width}
            height={height}
            initialPosition={200}
        >
            <LockableSelectUnitsWidget
                unitIds={allUnitIds}
                selectedUnitIds={selectedUnitIds}
                orderedRowIds={orderedRowIds}
                visibleRowIds={visibleRowIds}
                checkboxClickHandlerGenerator={checkboxClickHandlerGenerator}
                unitIdSelectionDispatch={unitIdSelectionDispatch}
                locked={selectionLocked}
                toggleLockStateCallback={toggleSelectionLocked}
            />
            <SpikeAmplitudesViewChild
                data={data}
                timeseriesLayoutOpts={{...timeseriesLayoutOpts, useYAxis: true }}
                width={0} // filled in by splitter
                height={0} // filled in by splitter
                selectedUnitIds={selectedUnitIds}
            />
        </Splitter>
    )
}

type ChildProps = {
    data: SpikeAmplitudesViewData
    selectedUnitIds: Set<number>
    timeseriesLayoutOpts?: TimeseriesLayoutOpts
    width: number
    height: number
}

const paintPanel = (context: CanvasRenderingContext2D, props: PanelProps) => {
    context.strokeStyle = 'black'
    context.setLineDash([5, 15]);
    context.beginPath()
    context.moveTo(0, props.pixelZero)
    context.lineTo(context.canvas.width, props.pixelZero)
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
}

const SpikeAmplitudesViewChild: FunctionComponent<ChildProps> = ({data, timeseriesLayoutOpts, selectedUnitIds, width, height}) => {
    useRecordingSelectionTimeInitialization(data.startTimeSec, data.endTimeSec)
    const {visibleTimeStartSeconds, visibleTimeEndSeconds} = useTimeRange()
    const [ampScaleFactor, setAmpScaleFactor] = useState<number>(1)

    const margins = useTimeseriesMargins(timeseriesLayoutOpts)

    // Compute the per-panel pixel drawing area dimensions.
    const panelCount = 1
    const toolbarWidth = timeseriesLayoutOpts?.hideTimeAxis ? 0 : DefaultToolbarWidth
    const { panelWidth, panelHeight } = usePanelDimensions(width - toolbarWidth, height, panelCount, panelSpacing, margins)
    const pixelsPerSecond = usePixelsPerSecond(panelWidth, visibleTimeStartSeconds, visibleTimeEndSeconds)


    const series = useMemo(() => (
        data.units.filter(u => (selectedUnitIds.has(u.unitId))).map(unit => {
            // we are going to assume that spikeTimesSec is *sorted*!
            // (Unfortunately there is no improvement from doing this.)
            const indices = unit.spikeTimesSec.reduce((array, time, indexInArrays) => {
                (visibleTimeStartSeconds !== undefined) && (visibleTimeStartSeconds <= time) && (visibleTimeEndSeconds !== undefined) && (time <= visibleTimeEndSeconds) && array.push(indexInArrays)
                return array
            }, [] as number[])
            const bottomIndex = indices[0]
            const topIndex = 1 + indices[indices.length - 1]

            const filteredTimes = unit.spikeTimesSec.slice(bottomIndex, topIndex)
            const filteredAmplitudes = unit.spikeAmplitudes.slice(bottomIndex, topIndex)
            return {
                unitId: unit.unitId,
                times: filteredTimes,
                amplitudes: filteredAmplitudes
            }
        })
    ), [data.units, visibleTimeStartSeconds, visibleTimeEndSeconds, selectedUnitIds])

    const amplitudeRange = useMemo(() => {
        const yMin = Math.min(0, min(series.map(S => (min(S.amplitudes)))))
        const yMax = Math.max(0, max(series.map(S => (max(S.amplitudes)))))
        return {yMin, yMax}
    }, [series])

    const pixelTransform = use2dPanelDataToPixelMatrix(
        pixelsPerSecond,
        visibleTimeStartSeconds,
        amplitudeRange.yMin,
        amplitudeRange.yMax,
        ampScaleFactor,
        panelHeight,
        true
    )

    const yTicks = useYAxisTicks({ datamin: amplitudeRange.yMin, datamax: amplitudeRange.yMax, pixelHeight: panelHeight })
    const finalYTicks = useProjectedYAxisTicks(yTicks, pixelTransform)
    const yTickSet: TickSet = {
        ticks: finalYTicks,
        datamin: amplitudeRange.yMin,
        datamax: amplitudeRange.yMax
    }

    const panels: TimeScrollViewPanel<PanelProps>[] = useMemo(() => {
        return [{
            key: `amplitudes`,
            label: ``,
            props: {
                // After the matrix multiplication, index [1][0] is the first (here only) element of the y-series.
                pixelZero: (multiply(pixelTransform, matrix([[0], [0], [1]])).valueOf() as number[][])[1][0],
                units: series.map(S => {
                    const augmentedPoints = matrix([S.times, S.amplitudes, new Array(S.times.length).fill(1) ])
                    const pixelPoints = multiply(pixelTransform, augmentedPoints).valueOf() as number[][]
                    return {
                        unitId: S.unitId,
                        pixelTimes: pixelPoints[0],
                        pixelAmplitudes: pixelPoints[1]
                    }
                })
            } as PanelProps,
            paint: paintPanel
        }]
    }, [series, pixelTransform])

    const scalingActions = useMemo(() => AmplitudeScaleToolbarEntries({ampScaleFactor, setAmpScaleFactor}), [ampScaleFactor])

    const content = series.length > 0 ? (
        <TimeScrollView
            margins={margins}
            panels={panels}
            panelSpacing={panelSpacing}
            optionalActionsAboveDefault={scalingActions}
            timeseriesLayoutOpts={timeseriesLayoutOpts}
            yTickSet={yTickSet}
            width={width}
            height={height}
        />
    ) : (
        <div>You must select one or more units.</div>
    )
    return content
}

const min = (a: number[]) => {
    return a.reduce((prev, current) => (prev < current) ? prev : current, a[0] || 0)
}

const max = (a: number[]) => {
    return a.reduce((prev, current) => (prev > current) ? prev : current, a[0] || 0)
}

export default SpikeAmplitudesView
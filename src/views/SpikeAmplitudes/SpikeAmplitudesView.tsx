import { AmplitudeScaleToolbarEntries } from 'libraries/AmplitudeScaleToolbarEntries'
import { useRecordingSelectionTimeInitialization, useTimeRange } from 'libraries/RecordingSelectionContext'
import { Splitter } from 'libraries/Splitter'
import { colorForUnitId } from 'libraries/UnitColors'
import { idToNum } from 'libraries/UnitSelectionContext'
import { FunctionComponent, useMemo, useState } from 'react'
import { convert2dDataSeries, getYAxisPixelZero, use2dScalingMatrix } from 'util/pointProjection'
import { TimeseriesLayoutOpts } from 'View'
import LockableSelectUnitsWidget from 'views/common/SelectUnitsWidget/LockableSelectUnitsWidget'
import useLocalSelectedUnitIds from 'views/common/SelectUnitsWidget/useLocalSelectedUnitIds'
import TimeScrollView, { TimeScrollViewPanel } from 'views/common/TimeScrollView/TimeScrollView'
import { usePanelDimensions, useTimeseriesMargins } from 'views/common/TimeScrollView/TimeScrollViewDimensions'
import useYAxisTicks, { useProjectedYAxisTicks } from 'views/common/TimeScrollView/YAxisTicks'
import { DefaultToolbarWidth } from 'views/common/TimeWidgetToolbarEntries'
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
const MAX_UNITS_SELECTED = 10

const SpikeAmplitudesView: FunctionComponent<Props> = ({data, timeseriesLayoutOpts, width, height}) => {
    const {selectedUnitIds, orderedUnitIds, visibleUnitIds, checkboxClickHandlerGenerator, unitIdSelectionDispatch, selectionLocked, toggleSelectionLocked} = useLocalSelectedUnitIds()

    const allUnitIds = useMemo(() => (
        data.units.map(u => (u.unitId))
    ), [data.units])
    
    return (
        <Splitter
            width={width}
            height={height}
            initialPosition={200}
        >
            {
                !data.hideUnitSelector && (
                    <LockableSelectUnitsWidget
                        unitIds={allUnitIds}
                        selectedUnitIds={selectedUnitIds}
                        orderedUnitIds={orderedUnitIds}
                        visibleUnitIds={visibleUnitIds}
                        checkboxClickHandlerGenerator={checkboxClickHandlerGenerator}
                        unitIdSelectionDispatch={unitIdSelectionDispatch}
                        locked={selectionLocked}
                        toggleLockStateCallback={toggleSelectionLocked}
                    />
                )
            }
            {
                selectedUnitIds.size > MAX_UNITS_SELECTED ? (
                    <div>Not showing spike amplitudes. Too many units selected (max = {MAX_UNITS_SELECTED}).</div>
                ) : selectedUnitIds.size === 0 ? (
                    <div>Select one or more units to view spike amplitudes.</div>
                ) : (
                    <SpikeAmplitudesViewChild
                        data={data}
                        timeseriesLayoutOpts={{...timeseriesLayoutOpts, useYAxis: true }}
                        width={0} // filled in by splitter
                        height={0} // filled in by splitter
                        selectedUnitIds={selectedUnitIds}
                    />
                )
            }
        </Splitter>
    )
}

type ChildProps = {
    data: SpikeAmplitudesViewData
    selectedUnitIds: Set<number | string>
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
        context.fillStyle = colorForUnitId(idToNum(unit.unitId))
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

    const maxNumPointsPerUnit = 5000

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
            const {times, amplitudes} = subsampleTimesAmplitudesIfNeeded(filteredTimes, filteredAmplitudes, maxNumPointsPerUnit)
            return {
                unitId: unit.unitId,
                times,
                amplitudes
            }
        })
    ), [data.units, visibleTimeStartSeconds, visibleTimeEndSeconds, selectedUnitIds])

    const amplitudeRange = useMemo(() => {
        const yMin = Math.min(0, min(series.map(S => (min(S.amplitudes)))))
        const yMax = Math.max(0, max(series.map(S => (max(S.amplitudes)))))
        return {yMin, yMax}
    }, [series])

    const pixelTransform = use2dScalingMatrix({
        totalPixelWidth: panelWidth,
        totalPixelHeight: panelHeight,
        dataXMin: visibleTimeStartSeconds,
        dataXMax: visibleTimeEndSeconds,
        dataYMin: amplitudeRange.yMin,
        dataYMax: amplitudeRange.yMax,
        yScaleFactor: ampScaleFactor,
    })

    // TODO: Figure out how to encapsulate y-axis management into timescrollview
    const yTicks = useYAxisTicks({ datamin: amplitudeRange.yMin, datamax: amplitudeRange.yMax, userSpecifiedZoom: ampScaleFactor, pixelHeight: panelHeight })
    const yTickSet = useProjectedYAxisTicks(yTicks, pixelTransform)

    const panels: TimeScrollViewPanel<PanelProps>[] = useMemo(() => {
        const pixelZero = getYAxisPixelZero(pixelTransform)
        return [{
            key: `amplitudes`,
            label: ``,
            props: {
                pixelZero,
                units: series.map(S => {
                    const pixelPoints = convert2dDataSeries(pixelTransform, [S.times, S.amplitudes])
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
    const extraButtons = useMemo(() => {return { aboveDefault: scalingActions }}, [scalingActions])

    const content = series.length > 0 ? (
        <TimeScrollView
            margins={margins}
            panels={panels}
            panelSpacing={panelSpacing}
            optionalActions={extraButtons}
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

const subsampleTimesAmplitudesIfNeeded = (x: number[], y: number[], maxNum: number) => {
    if (x.length <= maxNum) {
        return {times: x, amplitudes: y}
    }
    const times: number[] = []
    const amplitudes: number[] = []
    const incr = x.length / maxNum
    for (let i = 0; i < maxNum; i ++) {
        const j = Math.floor(i * incr)
        times.push(x[j])
        amplitudes.push(y[j])
    }
    return {times, amplitudes}
}

const min = (a: number[]) => {
    return a.reduce((prev, current) => (prev < current) ? prev : current, a[0] || 0)
}

const max = (a: number[]) => {
    return a.reduce((prev, current) => (prev > current) ? prev : current, a[0] || 0)
}

export default SpikeAmplitudesView
import { useRecordingSelectionInitialization, useTimeRange } from 'contexts/RecordingSelectionContext'
import { useSelectedUnitIds } from 'contexts/SortingSelectionContext'
import { matrix, multiply } from 'mathjs'
import Splitter from 'MountainWorkspace/components/Splitter/Splitter'
import React, { FunctionComponent, useCallback, useEffect, useMemo, useState } from 'react'
import colorForUnitId from 'views/common/colorForUnitId'
import TimeScrollView, { computePanelDimensions, computePixelsPerSecond, get1dTimeToPixelMatrix, TimeScrollViewPanel } from '../RasterPlot/TimeScrollView/TimeScrollView'
import LockableSelectUnitsWidget from './LockableSelectUnitsWidget'
import { SpikeAmplitudesViewData } from './SpikeAmplitudesViewData'

type Props = {
    data: SpikeAmplitudesViewData
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

const margins = {
    left: 30,
    right: 20,
    top: 20,
    bottom: 50
}

const panelSpacing = 4

const useLocalSelectedUnitIds = (locked: boolean) => {
    const {selectedUnitIds, setSelectedUnitIds} = useSelectedUnitIds()
    const [localValue, setLocalValue] = useState<number[]>([])
    useEffect(() => {
        if (!locked) {
            setLocalValue(selectedUnitIds)
        }
    }, [selectedUnitIds, locked])
    if (!locked) return {selectedUnitIds, setSelectedUnitIds}
    else {
        return {selectedUnitIds: localValue, setSelectedUnitIds: setLocalValue}
    }
}

const SpikeAmplitudesView: FunctionComponent<Props> = ({data, width, height}) => {
    const [selectionLocked, setSelectionLocked] = useState<boolean>(false)
    const toggleSelectionLocked = useCallback(() => {
        setSelectionLocked(a => (!a))
    }, [])
    const {selectedUnitIds, setSelectedUnitIds} = useLocalSelectedUnitIds(selectionLocked)

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
                setSelectedUnitIds={setSelectedUnitIds}
                locked={selectionLocked}
                toggleLockStateCallback={toggleSelectionLocked}
            />
            <SpikeAmplitudesViewChild
                data={data}
                width={0} // filled in by splitter
                height={0} // filled in by splitter
                selectedUnitIds={selectedUnitIds}
            />
        </Splitter>
    )
}

type ChildProps = {
    data: SpikeAmplitudesViewData
    selectedUnitIds: number[]
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

const SpikeAmplitudesViewChild: FunctionComponent<ChildProps> = ({data, selectedUnitIds, width, height}) => {
    useRecordingSelectionInitialization(data.startTimeSec, data.endTimeSec)
    const {visibleTimeStartSeconds, visibleTimeEndSeconds} = useTimeRange()

    // Compute the per-panel pixel drawing area dimensions.
    const panelCount = 1
    const { panelWidth, panelHeight } = useMemo(() => computePanelDimensions(width, height, panelCount, panelSpacing, margins), [width, height, panelCount])
    const pixelsPerSecond = useMemo(() => computePixelsPerSecond(panelWidth, visibleTimeStartSeconds, visibleTimeEndSeconds), [visibleTimeEndSeconds, visibleTimeStartSeconds, panelWidth])

    // Here we convert the native (time-based spike registry) data to pixel dimensions based on the per-panel allocated space.
    const timeToPixelMatrix = useMemo(() => get1dTimeToPixelMatrix(pixelsPerSecond, visibleTimeStartSeconds),
        [pixelsPerSecond, visibleTimeStartSeconds])

    const series = useMemo(() => (
        data.units.filter(u => (selectedUnitIds.includes(u.unitId))).map(unit => {
            const filteredTimes = unit.spikeTimesSec.filter(t => (visibleTimeStartSeconds <= t) && (t <= visibleTimeEndSeconds))
            const filteredAmplitudes = unit.spikeAmplitudes.filter((a, ii) => (visibleTimeStartSeconds <= unit.spikeTimesSec[ii]) && (unit.spikeTimesSec[ii] <= visibleTimeEndSeconds))
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

    const panels: TimeScrollViewPanel<PanelProps>[] = useMemo(() => {
        const yMap = ((y: number) => (
            (1 - (y - amplitudeRange.yMin) / (amplitudeRange.yMax - amplitudeRange.yMin)) * panelHeight
        ))
        return [{
            key: `amplitudes`,
            label: ``,
            props: {
                pixelZero: yMap(0),
                units: series.map(S => {
                    const augmentedTimes = matrix([S.times, new Array(S.times.length).fill(1) ])
                    const pixelTimes = multiply(timeToPixelMatrix, augmentedTimes).valueOf() as number[]
                    const pixelAmplitudes = S.amplitudes.map(a => (yMap(a)))                    
                    return {
                        unitId: S.unitId,
                        pixelTimes,
                        pixelAmplitudes
                    }
                })
            } as PanelProps,
            paint: paintPanel
        }]
    }, [series, amplitudeRange, timeToPixelMatrix, panelHeight])

    const selectedPanelKeys = useMemo(() => ([]), [])
    const setSelectedPanelKeys = useCallback((keys: string[]) => {}, [])

    const content = series.length > 0 ? (
        <TimeScrollView
            margins={margins}
            panels={panels}
            panelSpacing={panelSpacing}
            selectedPanelKeys={selectedPanelKeys}
            setSelectedPanelKeys={setSelectedPanelKeys}
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
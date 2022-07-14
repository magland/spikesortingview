import PlotGrid, { PGPlot } from 'components/PlotGrid/PlotGrid';
import { INITIALIZE_UNITS, useSelectedUnitIds } from 'contexts/UnitSelection/UnitSelectionContext';
import { mean } from 'mathjs';
import Splitter from 'MountainWorkspace/components/Splitter/Splitter';
import { useCallback, useRef } from 'react';
import { FunctionComponent, useEffect, useMemo, useState } from 'react';
import { FaMinus, FaPlus } from 'react-icons/fa';
import AmplitudeScaleToolbarEntries from 'views/common/AmplitudeScaleToolbarEntries';
import colorForUnitId from 'views/common/ColorHandling/colorForUnitId';
import { ToolbarItem } from 'views/common/Toolbars';
import UnitsTableBottomToolbar, { defaultUnitsTableBottomToolbarOptions, UnitsTableBottomToolbarOptions } from 'views/common/UnitsTableBottomToolbar';
import VerticalScrollView from 'views/common/VerticalScrollView';
import ViewToolbar from 'views/common/ViewToolbar';
import AverageWaveformPlot from './AverageWaveformPlot';
import { AverageWaveformsViewData } from './AverageWaveformsViewData';

type Props = {
    data: AverageWaveformsViewData
    width: number
    height: number
}

const AverageWaveformsView: FunctionComponent<Props> = ({data, width, height}) => {
    const [toolbarOptions, setToolbarOptions] = useState<UnitsTableBottomToolbarOptions>(defaultUnitsTableBottomToolbarOptions)
    const {selectedUnitIds, orderedUnitIds, plotClickHandlerGenerator, unitIdSelectionDispatch} = useSelectedUnitIds()

    const [ampScaleFactor, setAmpScaleFactor] = useState<number>(1)
    const [waveformsMode, setWaveformsMode] = useState<string>('geom')
    const [showWaveformStdev, setShowWaveformStdev] = useState<boolean>(true)
    const [showChannelIds, setShowChannelIds] = useState<boolean>(true)
    const [showFiletMignon, setShowFiletMignon] = useState<boolean>(data.showFiletMignon || false)

    const divRef = useRef<HTMLDivElement | null>(null)

    useEffect(() => {
        unitIdSelectionDispatch({ type: INITIALIZE_UNITS, newUnitOrder: data.averageWaveforms.map(aw => aw.unitId).sort((a, b) => idToNum(a) - idToNum(b)) })
    }, [data.averageWaveforms, unitIdSelectionDispatch])

    const [plotBoxScaleFactor, setPlotBoxScaleFactor] = useState<number>(2)

    const peakAmplitude = useMemo(() => {
        let ret = 0
        data.averageWaveforms.forEach(x => {
            x.waveform.forEach(y => {
                y.forEach(z => {
                    const abs = Math.abs(z)
                    if (abs > ret) ret = abs
                })
            })
        })
        return ret
    }, [data.averageWaveforms])

    const plots: PGPlot[] = useMemo(() => data.averageWaveforms.filter(a => (toolbarOptions.onlyShowSelected ? (selectedUnitIds.has(a.unitId)) : true)).map(aw => ({
        unitId: aw.unitId,
        key: aw.unitId,
        label: `Unit ${aw.unitId}`,
        labelColor: colorForUnitId(idToNum(aw.unitId)),
        clickHandler: !toolbarOptions.onlyShowSelected ? plotClickHandlerGenerator(aw.unitId) : undefined,
        props: {
            channelIds: aw.channelIds,
            waveform: subtractChannelMeans(aw.waveform),
            waveformStdDev: showWaveformStdev ? aw.waveformStdDev : undefined,
            layoutMode: waveformsMode,
            channelLocations: data.channelLocations,
            samplingFrequency: data.samplingFrequency,
            peakAmplitude,
            ampScaleFactor,
            waveformColor: colorForUnitId(idToNum(aw.unitId)),
            showChannelIds,
            width: 120 * plotBoxScaleFactor + (showFiletMignon ? (120 * plotBoxScaleFactor / 4) : 0),
            height: 120 * plotBoxScaleFactor,
            showFiletMignon
        }
    })), [data.averageWaveforms, data.channelLocations, data.samplingFrequency, peakAmplitude, waveformsMode, ampScaleFactor, plotClickHandlerGenerator, toolbarOptions.onlyShowSelected, selectedUnitIds, plotBoxScaleFactor, showWaveformStdev, showChannelIds, showFiletMignon])

    const plots2: PGPlot[] = useMemo(() => {
        if (orderedUnitIds) {
            return orderedUnitIds.map(unitId => (plots.filter(a => (a.unitId === unitId))[0])).filter(p => (p !== undefined))
        }
        else return plots
    }, [plots, orderedUnitIds])

    const customToolbarActions = useMemo(() => {
        const amplitudeScaleToolbarEntries = AmplitudeScaleToolbarEntries({ampScaleFactor, setAmpScaleFactor})
        const showElectrodeGeometryAction: ToolbarItem = {
            type: 'toggle',
            subtype: 'checkbox',
            callback: () => setWaveformsMode(m => (m === 'geom' ? 'vertical' : 'geom')),
            title: 'Show electrode geometry',
            selected: waveformsMode === 'geom'
        }
        const boxSizeActions: ToolbarItem[] = [
            {
                type: 'button',
                callback: () => setPlotBoxScaleFactor(s => (s * 1.3)),
                title: 'Increase box size',
                icon: <FaPlus />
            },
            {
                type: 'button',
                callback: () => setPlotBoxScaleFactor(s => (s / 1.3)),
                title: 'Decrease box size',
                icon: <FaMinus />
            }
        ]
        const showWaveformStdevAction: ToolbarItem = {
            type: 'toggle',
            subtype: 'checkbox',
            callback: () => setShowWaveformStdev(a => (!a)),
            title: 'Show waveform stdev',
            selected: showWaveformStdev === true
        }
        const showChannelIdsAction: ToolbarItem = {
            type: 'toggle',
            subtype: 'checkbox',
            callback: () => setShowChannelIds(a => (!a)),
            title: 'Show channel IDs',
            selected: showChannelIds === true
        }
        const showFiletMignonAction: ToolbarItem = {
            type: 'toggle',
            subtype: 'checkbox',
            callback: () => setShowFiletMignon(a => (!a)),
            title: 'Show "filet mignon"',
            selected: showFiletMignon === true
        }
        return [
            ...amplitudeScaleToolbarEntries,
            {type: 'divider'},
            showElectrodeGeometryAction,
            {type: 'divider'},
            ...boxSizeActions,
            {type: 'divider'},
            showWaveformStdevAction,
            {type: 'divider'},
            showChannelIdsAction,
            {type: 'divider'},
            showFiletMignonAction
        ]
    }, [waveformsMode, ampScaleFactor, showWaveformStdev, showChannelIds, showFiletMignon])

    const handleWheel = useCallback((e: React.WheelEvent) => {
        if (!e.shiftKey) return
        if (e.deltaY < 0) {
            setAmpScaleFactor(s => (s * 1.3))
        }
        else {
            setAmpScaleFactor(s => (s / 1.3))
        }
        return false // don't scroll
    }, [])

    useEffect(() => {
        if (!divRef.current) return
        divRef.current.addEventListener('wheel', (e: WheelEvent) => {
            if (e.shiftKey) {
                e.preventDefault()
            }
        })
    }, [divRef])

    const bottomToolbarHeight = 30

    const TOOLBAR_WIDTH = 36 // hard-coded for now
    return (
        <div
            onWheel={handleWheel}
            ref={divRef}
        >
            <Splitter
                width={width}
                height={height - bottomToolbarHeight}
                initialPosition={TOOLBAR_WIDTH}
                adjustable={false}
            >
                <ViewToolbar
                    width={TOOLBAR_WIDTH}
                    height={height}
                    customActions={customToolbarActions}
                />
                <VerticalScrollView width={0} height={0}>
                    <PlotGrid
                        plots={plots2}
                        plotComponent={AverageWaveformPlot}
                        selectedPlotKeys={!toolbarOptions.onlyShowSelected ? selectedUnitIds : undefined}
                    />
                </VerticalScrollView>
            </Splitter>
            <div style={{position: 'absolute', top: height - bottomToolbarHeight, height: bottomToolbarHeight, overflow: 'hidden'}}>
                <UnitsTableBottomToolbar
                    options={toolbarOptions}
                    setOptions={setToolbarOptions}
                />
            </div>
        </div>
    )
}

const subtractChannelMeans = (waveform: number[][]) => {
    return waveform.map(W => {
        const mean0 = computeMean(W)
        return W.map(a => (a - mean0))
    })
}

const computeMean = (ary: number[]) => ary.length > 0 ? mean(ary) : 0

export const idToNum = (a: any): number => {
    if (typeof(a) === 'number') return a
    else if (typeof(a) === 'string') {
        const b = stripLeadingNonNumeric(a)
        try {
            const x = parseFloat(b)
            if (!isNaN(x)) return x
            else return 0
        }
        catch {
            return 0
        }
    }
    else return 0
}

const stripLeadingNonNumeric = (a: string) => {
    let i = 0
    while ((i < a.length) && (isNonNumeric(a[i]))) {
        i ++
    }
    return a.slice(i)
}

const isNonNumeric = (a: string) => {
    return isNaN(parseFloat(a))
}

export default AverageWaveformsView
import { AmplitudeScaleToolbarEntries } from 'libraries/AmplitudeScaleToolbarEntries';
import { mean } from 'mathjs';
import { FunctionComponent, useCallback, useEffect, useMemo, useState } from 'react';
import { FaMinus, FaPlus } from 'react-icons/fa';
import { PGPlot, PlotGrid } from '../component-plot-grid';
import { Splitter } from '../component-splitter';
import { colorForUnitId } from '@figurl/spikesortingview.core-utils';
import { idToNum, INITIALIZE_UNITS, sortIds, useSelectedUnitIds } from '../context-unit-selection';
import { VerticalScrollView } from '../component-vertical-scroll-view';
import { defaultUnitsTableBottomToolbarOptions, ToolbarItem, UnitsTableBottomToolbar, UnitsTableBottomToolbarOptions, ViewToolbar } from '../../libraries/ViewToolbar';
import AverageWaveformPlot, { AverageWaveformPlotProps } from './AverageWaveformPlot';
import { AverageWaveformsViewData } from './AverageWaveformsViewData';

type Props = {
    data: AverageWaveformsViewData
    width: number
    height: number
}

const AverageWaveformsView: FunctionComponent<Props> = ({data, width, height}) => {
    const [toolbarOptions, setToolbarOptions] = useState<UnitsTableBottomToolbarOptions>({...defaultUnitsTableBottomToolbarOptions, onlyShowSelected: false})
    const {selectedUnitIds, orderedUnitIds, plotClickHandlerGenerator, unitIdSelectionDispatch} = useSelectedUnitIds()

    const [ampScaleFactor, setAmpScaleFactor] = useState<number>(1)
    const [waveformsMode, setWaveformsMode] = useState<'geom' | 'vertical'>('geom')
    const [showWaveformStdev, setShowWaveformStdev] = useState<boolean>(true)
    const [showChannelIds, setShowChannelIds] = useState<boolean>(false)
    const [showReferenceProbe, setShowReferenceProbe] = useState<boolean>(data.showReferenceProbe || false)
    const [showOverlapping, setShowOverlapping] = useState<boolean>(false)

    useEffect(() => {
        unitIdSelectionDispatch({ type: INITIALIZE_UNITS, newUnitOrder: sortIds(data.averageWaveforms.map(aw => aw.unitId)) })
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

    const plots: PGPlot[] = useMemo(() => data.averageWaveforms.filter(a => (toolbarOptions.onlyShowSelected ? (selectedUnitIds.has(a.unitId)) : true)).map(aw => {
        const units: {
            channelIds: (number | string)[];
            waveform: number[][];
            waveformStdDev?: number[][];
            waveformColor: string;
        }[] = [
            {
                channelIds: aw.channelIds,
                waveform: subtractChannelMeans(aw.waveform),
                waveformStdDev: showWaveformStdev && !showOverlapping ? aw.waveformStdDev : undefined,
                waveformColor: colorForUnitId(idToNum(aw.unitId))
            }
        ]
        const props: AverageWaveformPlotProps = {
            channelIds: aw.channelIds,
            units,
            layoutMode: waveformsMode,
            channelLocations: data.channelLocations,
            samplingFrequency: data.samplingFrequency,
            peakAmplitude,
            ampScaleFactor,
            showChannelIds,
            width: 120 * plotBoxScaleFactor + (showReferenceProbe ? (120 * plotBoxScaleFactor / 4) : 0),
            height: 120 * plotBoxScaleFactor,
            showReferenceProbe,
            disableAutoRotate: true
        }
        return {
            unitId: aw.unitId,
            key: aw.unitId,
            label: `Unit ${aw.unitId}`,
            labelColor: colorForUnitId(idToNum(aw.unitId)),
            clickHandler: !toolbarOptions.onlyShowSelected ? plotClickHandlerGenerator(aw.unitId) : undefined,
            props
        }
    }), [data.averageWaveforms, data.channelLocations, data.samplingFrequency, peakAmplitude, waveformsMode, ampScaleFactor, plotClickHandlerGenerator, toolbarOptions.onlyShowSelected, selectedUnitIds, plotBoxScaleFactor, showWaveformStdev, showChannelIds, showReferenceProbe, showOverlapping])

    const plots2: PGPlot[] = useMemo(() => {
        if (orderedUnitIds) {
            return orderedUnitIds.map(unitId => (plots.filter(a => (a.unitId === unitId))[0])).filter(p => (p !== undefined))
        }
        else return plots
    }, [plots, orderedUnitIds])

    const plots3: PGPlot[] = useMemo(() => {
        if (showOverlapping) {
            return combinePlotsForOverlappingView(plots2)
        }
        return plots2
    }, [plots2, showOverlapping])

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
        const showReferenceProbeAction: ToolbarItem = {
            type: 'toggle',
            subtype: 'checkbox',
            callback: () => setShowReferenceProbe(a => (!a)),
            title: 'Show reference probes',
            selected: showReferenceProbe === true
        }
        const showOverlappingAction: ToolbarItem = {
            type: 'toggle',
            subtype: 'checkbox',
            callback: () => setShowOverlapping(a => (!a)),
            title: 'Show overlapping',
            selected: showOverlapping === true
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
            showReferenceProbeAction,
            {type: 'divider'},
            showOverlappingAction
        ]
    }, [waveformsMode, ampScaleFactor, showWaveformStdev, showChannelIds, showOverlapping, showReferenceProbe])

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

    // useEffect(() => {
    //     if (!divRef.current) return
    //     divRef.current.addEventListener('wheel', (e: WheelEvent) => {
    //         if (e.shiftKey) {
    //             e.preventDefault()
    //         }
    //     })
    // }, [divRef])

    const bottomToolbarHeight = 30

    const TOOLBAR_WIDTH = 36 // hard-coded for now
    return (
        <div
            onWheel={handleWheel}
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
                        plots={plots3}
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

const combinePlotsForOverlappingView = (plots: PGPlot[]): PGPlot[] => {
    if (plots.length === 0) return plots
    const thePlot: PGPlot = {...plots[0], props: {...plots[0].props}}

    const plotProps: AverageWaveformPlotProps = thePlot.props as any as AverageWaveformPlotProps
    thePlot.key = 'overlaping'
    thePlot.label = 'Overlaping'
    thePlot.labelColor = 'black'
    thePlot.unitId = 'overlaping'
    plotProps.height *= 2
    plotProps.width *= 2

    const allChannelIdsSet = new Set<number | string>()
    for (let plot of plots) {
        for (let id of plot.props.channelIds) {
            allChannelIdsSet.add(id)
        }
    }
    const allChannelIds = sortIds([...allChannelIdsSet])
    plotProps.channelIds = allChannelIds
    
    plotProps.units = plots.map(p => (p.props.units[0]))

    return [thePlot]
}

const subtractChannelMeans = (waveform: number[][]): number[][] => {
    return waveform.map(W => {
        const mean0 = computeMean(W)
        return W.map(a => (a - mean0))
    })
}

const computeMean = (ary: number[]) => ary.length > 0 ? mean(ary) : 0

export default AverageWaveformsView
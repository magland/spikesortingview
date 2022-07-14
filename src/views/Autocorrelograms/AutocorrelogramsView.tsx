import PlotGrid, { PGPlot } from 'components/PlotGrid/PlotGrid';
import { INITIALIZE_UNITS, useSelectedUnitIds } from 'contexts/UnitSelection/UnitSelectionContext';
import Splitter from 'MountainWorkspace/components/Splitter/Splitter';
import React, { FunctionComponent, useEffect, useMemo, useState } from 'react';
import { FaMinus, FaPlus } from 'react-icons/fa';
import { idToNum } from 'views/AverageWaveforms/AverageWaveformsView';
import colorForUnitId from 'views/common/ColorHandling/colorForUnitId';
import { ToolbarItem } from 'views/common/Toolbars';
import UnitsTableBottomToolbar, { defaultUnitsTableBottomToolbarOptions, UnitsTableBottomToolbarOptions } from 'views/common/UnitsTableBottomToolbar';
import VerticalScrollView from 'views/common/VerticalScrollView';
import ViewToolbar from 'views/common/ViewToolbar';
import { AutocorrelogramsViewData } from './AutocorrelogramsViewData';
import CorrelogramPlot from './CorrelogramPlot';

type Props = {
    data: AutocorrelogramsViewData
    width: number
    height: number
}

const AutocorrelogramsView: FunctionComponent<Props> = ({data, width, height}) => {
    const [toolbarOptions, setToolbarOptions] = useState<UnitsTableBottomToolbarOptions>(defaultUnitsTableBottomToolbarOptions)
    const {selectedUnitIds, orderedUnitIds, plotClickHandlerGenerator, unitIdSelectionDispatch} = useSelectedUnitIds()
    const [plotBoxScaleFactor, setPlotBoxScaleFactor] = useState<number>(1)
    const [showXAxis, setShowXAxis] = useState<boolean>(false)

    useEffect(() => {
        unitIdSelectionDispatch({ type: INITIALIZE_UNITS, newUnitOrder: data.autocorrelograms.map(aw => aw.unitId).sort((a, b) => idToNum(a) - idToNum(b))})
    }, [data.autocorrelograms, unitIdSelectionDispatch])

    const plots: PGPlot[] = useMemo(() => (data.autocorrelograms.filter(a => (toolbarOptions.onlyShowSelected ? selectedUnitIds.has(a.unitId) : true)).map(ac => ({
        unitId: ac.unitId,
        key: ac.unitId,
        label: `Unit ${ac.unitId}`,
        labelColor: colorForUnitId(idToNum(ac.unitId)),
        clickHandler: !toolbarOptions.onlyShowSelected ? plotClickHandlerGenerator(ac.unitId) : undefined,
        props: {
            binEdgesSec: ac.binEdgesSec,
            binCounts: ac.binCounts,
            color: colorForUnitId(idToNum(ac.unitId)),
            width: 120 * plotBoxScaleFactor,
            height: 120 * plotBoxScaleFactor,
            hideXAxis: !showXAxis
        }
    }))), [data.autocorrelograms, plotClickHandlerGenerator, toolbarOptions.onlyShowSelected, selectedUnitIds, showXAxis, plotBoxScaleFactor])
    const plots2: PGPlot[] = useMemo(() => {
        if (orderedUnitIds) {
            return orderedUnitIds.map(unitId => (plots.filter(a => (a.unitId === unitId))[0])).filter(p => (p !== undefined))
        }
        else return plots
    }, [plots, orderedUnitIds])

    const customToolbarActions = useMemo(() => {
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
        const showXAxisAction: ToolbarItem = {
            type: 'toggle',
            subtype: 'checkbox',
            callback: () => setShowXAxis(a => (!a)),
            title: 'Show X Axis',
            selected: showXAxis === true
        }
        return [
            ...boxSizeActions,
            {type: 'divider'},
            showXAxisAction
        ]
    }, [showXAxis])

    const bottomToolbarHeight = 30
    const TOOLBAR_WIDTH = 36 // hard-coded for now
    return (
        <div>
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
                        plotComponent={CorrelogramPlot}
                        selectedPlotKeys={toolbarOptions.onlyShowSelected ? undefined : selectedUnitIds}
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

export default AutocorrelogramsView
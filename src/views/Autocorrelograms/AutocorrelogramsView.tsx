import PlotGrid, { PGPlot } from 'components/PlotGrid/PlotGrid';
import { INITIALIZE_ROWS, useSelectedUnitIds } from 'contexts/RowSelection/RowSelectionContext';
import React, { FunctionComponent, useEffect, useMemo, useState } from 'react';
import colorForUnitId from 'views/common/ColorHandling/colorForUnitId';
import UnitsTableBottomToolbar, { defaultUnitsTableBottomToolbarOptions, UnitsTableBottomToolbarOptions } from 'views/common/UnitsTableBottomToolbar';
import { AutocorrelogramsViewData } from './AutocorrelogramsViewData';
import CorrelogramPlot from './CorrelogramPlot';

type Props = {
    data: AutocorrelogramsViewData
    width: number
    height: number
}

const AutocorrelogramsView: FunctionComponent<Props> = ({data, width, height}) => {
    const [toolbarOptions, setToolbarOptions] = useState<UnitsTableBottomToolbarOptions>(defaultUnitsTableBottomToolbarOptions)
    const {selectedUnitIds, orderedRowIds, plotClickHandlerGenerator, unitIdSelectionDispatch} = useSelectedUnitIds()

    useEffect(() => {
        unitIdSelectionDispatch({ type: INITIALIZE_ROWS, newRowOrder: data.autocorrelograms.map(aw => aw.unitId).sort((a, b) => a - b) })
    }, [data.autocorrelograms, unitIdSelectionDispatch])

    const plots: PGPlot[] = useMemo(() => (data.autocorrelograms.filter(a => (toolbarOptions.onlyShowSelected ? selectedUnitIds.has(a.unitId) : true)).map(ac => ({
        numericId: ac.unitId,
        key: `${ac.unitId}`,
        label: `Unit ${ac.unitId}`,
        labelColor: colorForUnitId(ac.unitId),
        clickHandler: !toolbarOptions.onlyShowSelected ? plotClickHandlerGenerator(ac.unitId) : undefined,
        props: {
            binEdgesSec: ac.binEdgesSec,
            binCounts: ac.binCounts,
            color: colorForUnitId(ac.unitId),
            width: 120,
            height: 120
        }
    }))), [data.autocorrelograms, plotClickHandlerGenerator, toolbarOptions.onlyShowSelected, selectedUnitIds])
    const bottomToolbarHeight = 30
    const divStyle: React.CSSProperties = useMemo(() => ({
        width: width - 20, // leave room for the scrollbar
        height: height - bottomToolbarHeight,
        position: 'relative',
        overflowY: 'auto'
    }), [width, height])
    return (
        <div>
            <div style={divStyle}>
                <PlotGrid
                    plots={plots}
                    plotComponent={CorrelogramPlot}
                    selectedPlotKeys={toolbarOptions.onlyShowSelected ? undefined : selectedUnitIds}
                    orderedPlotIds={orderedRowIds}
                />
            </div>
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
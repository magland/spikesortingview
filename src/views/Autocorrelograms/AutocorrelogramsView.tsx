import PlotGrid, { PGPlot } from 'components/PlotGrid/PlotGrid';
import { INITIALIZE_ROWS, useSelectedUnitIds } from 'contexts/RowSelection/RowSelectionContext';
import React, { FunctionComponent, useEffect, useMemo } from 'react';
import colorForUnitId from 'views/common/ColorHandling/colorForUnitId';
import { AutocorrelogramsViewData } from './AutocorrelogramsViewData';
import CorrelogramPlot from './CorrelogramPlot';

type Props = {
    data: AutocorrelogramsViewData
    width: number
    height: number
}

const AutocorrelogramsView: FunctionComponent<Props> = ({data, width, height}) => {
    const {selectedUnitIds, orderedRowIds, plotClickHandlerGenerator, unitIdSelectionDispatch} = useSelectedUnitIds()

    useEffect(() => {
        unitIdSelectionDispatch({ type: INITIALIZE_ROWS, newRowOrder: data.autocorrelograms.map(aw => aw.unitId).sort((a, b) => a - b) })
    }, [data.autocorrelograms, unitIdSelectionDispatch])

    const plots: PGPlot[] = useMemo(() => (data.autocorrelograms.map(ac => ({
        numericId: ac.unitId,
        key: `${ac.unitId}`,
        label: `Unit ${ac.unitId}`,
        labelColor: colorForUnitId(ac.unitId),
        clickHandler: plotClickHandlerGenerator(ac.unitId),
        props: {
            binEdgesSec: ac.binEdgesSec,
            binCounts: ac.binCounts,
            color: colorForUnitId(ac.unitId),
            width: 120,
            height: 120
        }
    }))), [data.autocorrelograms, plotClickHandlerGenerator])
    const divStyle: React.CSSProperties = useMemo(() => ({
        width: width - 20, // leave room for the scrollbar
        height,
        position: 'relative',
        overflowY: 'auto'
    }), [width, height])
    return (
        <div style={divStyle}>
            <PlotGrid
                plots={plots}
                plotComponent={CorrelogramPlot}
                selectedPlotKeys={selectedUnitIds}
                orderedPlotIds={orderedRowIds}
            />
        </div>
    )
}

export default AutocorrelogramsView
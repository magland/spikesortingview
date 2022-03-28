import PlotGrid from 'components/PlotGrid/PlotGrid';
import { useSelectedUnitIds } from 'contexts/RowSelectionContext';
import React, { FunctionComponent, useMemo } from 'react';
import colorForUnitId from 'views/common/colorForUnitId';
import { AutocorrelogramsViewData } from './AutocorrelogramsViewData';
import CorrelogramPlot from './CorrelogramPlot';

type Props = {
    data: AutocorrelogramsViewData
    width: number
    height: number
}

const AutocorrelogramsView: FunctionComponent<Props> = ({data, width, height}) => {
    const {selectedUnitIds, unitIdSelectionDispatch} = useSelectedUnitIds()
    const plots = useMemo(() => (data.autocorrelograms.sort((a1, a2) => (a1.unitId - a2.unitId)).map(ac => ({
        key: `${ac.unitId}`,
        label: `Unit ${ac.unitId}`,
        labelColor: colorForUnitId(ac.unitId),
        props: {
            binEdgesSec: ac.binEdgesSec,
            binCounts: ac.binCounts,
            color: colorForUnitId(ac.unitId),
            width: 120,
            height: 120
        }
    }))), [data.autocorrelograms])
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
            />
        </div>
    )
}

export default AutocorrelogramsView
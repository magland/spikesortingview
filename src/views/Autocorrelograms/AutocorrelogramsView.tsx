import PlotGrid from 'components/PlotGrid/PlotGrid';
import React, { FunctionComponent, useCallback, useMemo, useState } from 'react';
import CorrelogramPlot from './CorrelogramPlot';
import { AutocorrelogramsViewData } from './AutocorrelogramsViewData';

type Props = {
    data: AutocorrelogramsViewData
    width: number
    height: number
}

const AutocorrelogramsView: FunctionComponent<Props> = ({data, width, height}) => {
    const [selectedUnitIds, setSelectedUnitIds] = useState<number[]>([])
    const selectedPlotKeys = useMemo(() => (selectedUnitIds.map(u => (`${u}`))), [selectedUnitIds])
    const setSelectedPlotKeys = useCallback((keys: string[]) => {setSelectedUnitIds(keys.map(k => (Number(k))))}, [setSelectedUnitIds])
    const plots = useMemo(() => (data.autocorrelograms.map(ac => ({
        key: `${ac.unitId}`,
        label: `Unit ${ac.unitId}`,
        props: {
            binEdgesSec: ac.binEdgesSec,
            binCounts: ac.binCounts,
            width: 150,
            height: 150
        }
    }))), [data.autocorrelograms])
    return (
        <PlotGrid
            plots={plots}
            plotComponent={CorrelogramPlot}
            selectedPlotKeys={selectedPlotKeys}
            setSelectedPlotKeys={setSelectedPlotKeys}
        />
    )
}

export default AutocorrelogramsView
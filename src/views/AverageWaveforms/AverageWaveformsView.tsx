import PlotGrid from 'components/PlotGrid/PlotGrid';
import { useSelectedUnitIds } from 'contexts/SortingSelectionContext';
import React, { FunctionComponent, useCallback, useMemo } from 'react';
import { AverageWaveformsViewData } from './AverageWaveformsViewData';
import AverageWaveformPlot from './AverageWaveformPlot';

type Props = {
    data: AverageWaveformsViewData
    width: number
    height: number
}

const AverageWaveformsView: FunctionComponent<Props> = ({data, width, height}) => {
    // const [selectedUnitIds, setSelectedUnitIds] = useState<number[]>([])
    const {selectedUnitIds, setSelectedUnitIds} = useSelectedUnitIds()
    const selectedPlotKeys = useMemo(() => (selectedUnitIds.map(u => (`${u}`))), [selectedUnitIds])
    const setSelectedPlotKeys = useCallback((keys: string[]) => {
        setSelectedUnitIds(keys.map(k => (Number(k))))
    }, [setSelectedUnitIds])
    const plots = useMemo(() => (data.averageWaveforms.map(aw => ({
        key: `${aw.unitId}`,
        label: `Unit ${aw.unitId}`,
        props: {
            channelIds: aw.channelIds,
            waveform: aw.waveform,
            samplingFrequency: data.samplingFrequency,
            noiseLevel: data.noiseLevel,
            width: 120,
            height: 120
        }
    }))), [data.averageWaveforms, data.samplingFrequency, data.noiseLevel])
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
                plotComponent={AverageWaveformPlot}
                selectedPlotKeys={selectedPlotKeys}
                setSelectedPlotKeys={setSelectedPlotKeys}
            />
        </div>
    )
}

export default AverageWaveformsView
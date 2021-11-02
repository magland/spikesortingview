import PlotGrid from 'components/PlotGrid/PlotGrid';
import { useSelectedUnitIds } from 'contexts/SortingSelectionContext';
import React, { FunctionComponent, useCallback, useMemo } from 'react';
import { AverageWaveformsViewData } from './AverageWaveformsViewData';
import AverageWaveformPlot from './AverageWaveformPlot';
import colorForUnitId from 'views/common/colorForUnitId';

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
    const plots = useMemo(() => (data.averageWaveforms.sort((a1, a2) => (a1.unitId - a2.unitId)).map(aw => ({
        key: `${aw.unitId}`,
        label: `Unit ${aw.unitId}`,
        labelColor: colorForUnitId(aw.unitId),
        props: {
            channelIds: aw.channelIds,
            waveform: subtractChannelMeans(aw.waveform),
            channelLocations: data.channelLocations,
            samplingFrequency: data.samplingFrequency,
            noiseLevel: data.noiseLevel,
            width: 120,
            height: 120
        }
    }))), [data.averageWaveforms, data.channelLocations, data.samplingFrequency, data.noiseLevel])
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

const subtractChannelMeans = (waveform: number[][]) => {
    return waveform.map(W => {
        const mean0 = computeMean(W)
        return W.map(a => (a - mean0))
    })
}

const computeMean = (x: number[]) => {
    if (x.length === 0) return 0
    let sum = 0
    for (let a of x) sum += a
    return sum / x.length
}

export default AverageWaveformsView
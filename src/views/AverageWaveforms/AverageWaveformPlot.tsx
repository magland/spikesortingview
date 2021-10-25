import React, { FunctionComponent, useMemo } from 'react';
import WaveformWidget from './WaveformWidget/WaveformWidget'

type Props = {
    channelIds: number[]
    waveform: number[][]
    samplingFrequency: number
    noiseLevel: number
    width: number
    height: number
}

const AverageWaveformPlot: FunctionComponent<Props> = ({channelIds, waveform, samplingFrequency, noiseLevel, width, height}) => {
    const electrodes = useMemo(() => (
        channelIds.map(channelId => ({
            id: channelId,
            label: `${channelId}`,
            x: channelId, // for now
            y: 0
        }))
    ), [channelIds])
    const waveformOpts = useMemo(() => ({waveformWidth: 1}), [])
    const selectedElectrodeIds = useMemo(() => ([]), [])
    return (
        <WaveformWidget
            waveform={waveform}
            electrodes={electrodes}
            ampScaleFactor={1} // for now
            layoutMode={'vertical'} // for now
            width={width}
            height={height}
            selectedElectrodeIds={selectedElectrodeIds}
            showLabels={true} // for now
            noiseLevel={noiseLevel}
            samplingFrequency={samplingFrequency}
            waveformOpts={waveformOpts}
        />
    )
}

export default AverageWaveformPlot
import React, { FunctionComponent, useMemo } from 'react';
import WaveformWidget from './WaveformWidget/WaveformWidget'

type Props = {
    channelIds: number[]
    waveform: number[][]
    channelLocations?: {[key: string]: number[]}
    samplingFrequency: number
    noiseLevel: number
    width: number
    height: number
}

const AverageWaveformPlot: FunctionComponent<Props> = ({channelIds, waveform, channelLocations, samplingFrequency, noiseLevel, width, height}) => {
    const electrodes = useMemo(() => {
        const locs = channelLocations || {}
        return channelIds.map(channelId => ({
            id: channelId,
            label: `${channelId}`,
            x: locs[`${channelId}`] ? locs[`${channelId}`][0] : channelId,
            y: locs[`${channelId}`] ? locs[`${channelId}`][1] : 0
        }))
    }, [channelIds, channelLocations])
    const waveformOpts = useMemo(() => ({waveformWidth: 1}), [])
    const selectedElectrodeIds = useMemo(() => ([]), [])
    return (
        <WaveformWidget
            waveform={waveform}
            electrodes={electrodes}
            ampScaleFactor={1.5} // for now
            layoutMode={channelLocations ? 'geom' : 'vertical'} // for now
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
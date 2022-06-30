import React, { FunctionComponent, useMemo } from 'react';
import WaveformWidget from './WaveformWidget/WaveformWidget';
import {WaveformColors} from './WaveformWidget/WaveformPlot'

type Props = {
    channelIds: number[]
    waveform: number[][]
    waveformStdDev?: number[][]
    layoutMode: 'geom' | 'vertical'
    channelLocations?: {[key: string]: number[]}
    samplingFrequency: number
    noiseLevel: number
    ampScaleFactor: number
    waveformColor: string
    width: number
    height: number
}

const AverageWaveformPlot: FunctionComponent<Props> = ({channelIds, waveform, waveformStdDev, layoutMode, channelLocations, samplingFrequency, noiseLevel, ampScaleFactor, waveformColor, width, height}) => {
    const electrodes = useMemo(() => {
        const locs = channelLocations || {}
        return channelIds.map(channelId => ({
            id: channelId,
            label: `${channelId}`,
            x: locs[`${channelId}`] ? locs[`${channelId}`][0] : channelId,
            y: locs[`${channelId}`] ? locs[`${channelId}`][1] : 0
        }))
    }, [channelIds, channelLocations])
    const waveformOpts = useMemo(() => {
        const waveformColors: WaveformColors = {
            base: waveformColor
        }
        return {
            waveformWidth: 2,
            colors: waveformColors
        }
    }, [waveformColor])
    return (
        <WaveformWidget
            waveform={waveform}
            waveformStdDev={waveformStdDev}
            electrodes={electrodes}
            ampScaleFactor={ampScaleFactor}
            layoutMode={channelLocations ? layoutMode : 'vertical'}
            width={width}
            height={height}
            showLabels={true} // for now
            noiseLevel={noiseLevel}
            samplingFrequency={samplingFrequency}
            waveformOpts={waveformOpts}
        />
    )
}

export default AverageWaveformPlot
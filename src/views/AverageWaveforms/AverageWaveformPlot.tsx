import RecordingSelectionContext, { useRecordingSelection } from 'contexts/RecordingSelectionContext';
import { FunctionComponent, useMemo } from 'react';
import { idToNum } from './AverageWaveformsView';
import ElectrodeGeometry from './WaveformWidget/sharedDrawnComponents/ElectrodeGeometry';
import { WaveformColors } from './WaveformWidget/WaveformPlot';
import WaveformWidget from './WaveformWidget/WaveformWidget';

type Props = {
    channelIds: (number | string)[]
    waveform: number[][]
    waveformStdDev?: number[][]
    layoutMode: 'geom' | 'vertical'
    channelLocations?: {[key: string]: number[]}
    samplingFrequency: number
    peakAmplitude: number
    ampScaleFactor: number
    waveformColor: string
    showChannelIds: boolean
    width: number
    height: number
    showFiletMignon?: boolean
}

const AverageWaveformPlot: FunctionComponent<Props> = ({channelIds, waveform, waveformStdDev, layoutMode, channelLocations, samplingFrequency, peakAmplitude, ampScaleFactor, waveformColor, showChannelIds, showFiletMignon, width, height}) => {
    const electrodes = useMemo(() => {
        const locs = channelLocations || {}
        return channelIds.map(channelId => ({
            id: channelId,
            label: `${channelId}`,
            x: locs[`${channelId}`] !== undefined ? locs[`${channelId}`][0] : idToNum(channelId),
            y: locs[`${channelId}`] !== undefined ? locs[`${channelId}`][1] : 0
        }))
    }, [channelIds, channelLocations])
    const allChannelIds = useMemo(() => (Object.keys(channelLocations || {})), [channelLocations])
    const allElectrodes = useMemo(() => {
        const locs = channelLocations || {}
        return allChannelIds.map(channelId => ({
            id: channelId,
            label: `${channelId}`,
            x: locs[`${channelId}`] !== undefined ? locs[`${channelId}`][0] : idToNum(channelId),
            y: locs[`${channelId}`] !== undefined ? locs[`${channelId}`][1] : 0
        }))
    }, [allChannelIds, channelLocations])
    const waveformOpts = useMemo(() => {
        const waveformColors: WaveformColors = {
            base: waveformColor
        }
        return {
            waveformWidth: 2,
            colors: waveformColors,
            showChannelIds
        }
    }, [waveformColor, showChannelIds])
    const filetMignonWidth = width / 4
    const waveformWidget = (
        <WaveformWidget
            waveform={waveform}
            waveformStdDev={waveformStdDev}
            electrodes={electrodes}
            ampScaleFactor={ampScaleFactor}
            layoutMode={channelLocations ? layoutMode : 'vertical'}
            width={showFiletMignon ? width - filetMignonWidth : width}
            height={height}
            showLabels={true} // for now
            peakAmplitude={peakAmplitude}
            samplingFrequency={samplingFrequency}
            waveformOpts={waveformOpts}
        />
    )

    const {recordingSelection} = useRecordingSelection()

    const recordingSelectionProviderValue = useMemo(() => (
        {recordingSelection: {...recordingSelection, selectedElectrodeIds: channelIds}, recordingSelectionDispatch: () => {}}
    ), [recordingSelection, channelIds])

    return showFiletMignon ? (
        <div style={{position: 'relative', width, height}}>
            <div style={{position: 'absolute', left: 0, top: 0, width: filetMignonWidth, height}}>
                <RecordingSelectionContext.Provider value={recordingSelectionProviderValue}>
                    <ElectrodeGeometry
                        electrodes={allElectrodes}
                        disableSelection={true}
                        width={filetMignonWidth}
                        height={height}
                    />
                </RecordingSelectionContext.Provider>
            </div>
            <div style={{position: 'absolute', left: filetMignonWidth, top: 0, width: width - filetMignonWidth, height}}>
                {waveformWidget}
            </div>
        </div>
    ) : (
        waveformWidget
    )
}

export default AverageWaveformPlot
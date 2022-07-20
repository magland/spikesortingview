import RecordingSelectionContext, { useRecordingSelection } from 'contexts/RecordingSelectionContext';
import { FunctionComponent, useMemo } from 'react';
import { idToNum } from './AverageWaveformsView';
import ElectrodeGeometry from './WaveformWidget/sharedDrawnComponents/ElectrodeGeometry';
import { WaveformColors } from './WaveformWidget/WaveformPlot';
import WaveformWidget from './WaveformWidget/WaveformWidget';

export type AverageWaveformPlotProps = {
    channelIds: (number | string)[]
    units: {
        channelIds: (number | string)[]
        waveform: number[][]
        waveformStdDev?: number[][]
        waveformColor: string
    }[]
    layoutMode: 'geom' | 'vertical'
    channelLocations?: {[key: string]: number[]}
    samplingFrequency: number
    peakAmplitude: number
    ampScaleFactor: number
    showChannelIds: boolean
    width: number
    height: number
    showReferenceProbe?: boolean
    disableAutoRotate?: boolean
}

const AverageWaveformPlot: FunctionComponent<AverageWaveformPlotProps> = ({channelIds, units, layoutMode, channelLocations, samplingFrequency, peakAmplitude, ampScaleFactor, showChannelIds, showReferenceProbe, disableAutoRotate, width, height}) => {
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
    const referenceProbeWidth = width / 4

    const waveforms = useMemo(() => (
        units.map(unit => {
            const waveformColors: WaveformColors = {
                base: unit.waveformColor
            }
            const electrodeIndices = []
            for (let id of unit.channelIds) {
                electrodeIndices.push(electrodes.map(e => (e.id)).indexOf(id))
            }
            return {
                electrodeIndices,
                waveform: unit.waveform,
                waveformStdDev: unit.waveformStdDev,
                waveformColors
            }
        })
    ), [electrodes, units])

    const waveformWidget = (
        <WaveformWidget
            waveforms={waveforms}
            electrodes={electrodes}
            ampScaleFactor={ampScaleFactor}
            layoutMode={channelLocations ? layoutMode : 'vertical'}
            width={showReferenceProbe ? width - referenceProbeWidth : width}
            height={height}
            showLabels={true} // for now
            peakAmplitude={peakAmplitude}
            samplingFrequency={samplingFrequency}
            showChannelIds={showChannelIds}
            waveformWidth={2}
            disableAutoRotate={disableAutoRotate}
        />
    )

    const {recordingSelection} = useRecordingSelection()

    const recordingSelectionProviderValue = useMemo(() => (
        {recordingSelection: {...recordingSelection, selectedElectrodeIds: channelIds}, recordingSelectionDispatch: () => {}}
    ), [recordingSelection, channelIds])

    return showReferenceProbe ? (
        <div style={{position: 'relative', width, height}}>
            <div style={{position: 'absolute', left: 0, top: 0, width: referenceProbeWidth, height}}>
                <RecordingSelectionContext.Provider value={recordingSelectionProviderValue}>
                    <ElectrodeGeometry
                        electrodes={allElectrodes}
                        disableSelection={false}
                        width={referenceProbeWidth}
                        height={height}
                    />
                </RecordingSelectionContext.Provider>
            </div>
            <div style={{position: 'absolute', left: referenceProbeWidth, top: 0, width: width - referenceProbeWidth, height}}>
                {waveformWidget}
            </div>
        </div>
    ) : (
        waveformWidget
    )
}

export default AverageWaveformPlot
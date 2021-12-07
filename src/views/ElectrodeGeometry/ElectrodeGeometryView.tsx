import { useElectrodeSet, useRecordingSelectionElectrodeInitialization } from 'contexts/RecordingSelectionContext'
import React, { FunctionComponent } from 'react'
import ElectrodeGeometry from 'views/AverageWaveforms/WaveformWidget/sharedDrawnComponents/ElectrodeGeometry'
import { ElectrodeGeometryViewData } from './ElectrodeGeometryViewData'

type ElectrodeGeometryViewProps = {
    data: ElectrodeGeometryViewData
    width: number
    height: number
}

const ElectrodeGeometryView: FunctionComponent<ElectrodeGeometryViewProps> = (props: ElectrodeGeometryViewProps) => {
    const { data, width, height } = props
    const channelIds = Object.keys(data.channelLocations).map(id => parseInt(id))

    useRecordingSelectionElectrodeInitialization(channelIds, data.channelLocations)
    const { electrodes } = useElectrodeSet()

    // TODO: Have the underlying component pull the electrode list from context
    // and have the parent pass in only a list of the visible electrodes to filter

    return (
        <ElectrodeGeometry
            width={width}
            height={height}
            electrodes={electrodes}
        />
    )
}


export default ElectrodeGeometryView